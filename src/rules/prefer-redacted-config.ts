/**
 * Secret-shaped configuration values that escape redaction surface in two
 * idiomatic ways:
 *
 *   1. Primitive loaders: `Config.string("API_KEY")` /
 *      `Config.nonEmptyString("GITHUB_TOKEN")` — should be `Config.redacted(...)`.
 *
 *   2. Struct fields: `Config.schema(Schema.Struct({ apiKey: Schema.String }))` —
 *      the `apiKey` field should wrap its inner schema in `Schema.Redacted(...)`.
 *
 * The detection is conservative: a key is "secret-shaped" only when its name
 * matches a small vocabulary of conventional secret terms (api key, auth
 * token, password, private key, client secret, DSN, …). The value side flags
 * only the bare `Schema.String` / `Schema.NonEmptyString` member access —
 * anything piped or wrapped (e.g. `Schema.Redacted(Schema.String)`) escapes
 * detection because it is no longer a plain MemberExpression.
 *
 * The struct-field detection walks the struct's properties from the
 * `Config.schema(Schema.Struct({ ... }))` call site, which avoids the
 * three-way `Property` union (ObjectProperty / BindingProperty /
 * AssignmentTargetProperty) that hits the `Property` visitor.
 */

import type { ESTree } from 'effect-oxlint';

import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain: secret-shaped names, redaction-bearing APIs
// ---------------------------------------------------------------------------

/**
 * Case-insensitive pattern matching conventional secret-value naming. Kept
 * inline (rather than as a separate literal union) because the surface is a
 * single regex shared by both the primitive and struct-field detections.
 */
const SECRET_KEY_PATTERN =
	/(?:api[_-]?key|auth[_-]?token|token|secret|password|passwd|private[_-]?key|client[_-]?secret|database[_-]?url|db[_-]?url|connection[_-]?string|dsn)/i;

const SecretKeyName = Schema.String.check(
	Schema.isPattern(SECRET_KEY_PATTERN, {
		identifier: 'SecretKeyNameCheck',
		title: 'Secret-Looking Key Name',
		description:
			'A configuration key whose name conventionally identifies a secret value (api key, auth token, password, private key, client secret, DSN, etc.).',
		message: 'Key name matches a secret-value convention'
	})
).pipe(
	Schema.brand('SecretKeyName'),
	Schema.annotate({
		title: 'SecretKeyName',
		description:
			'Configuration key name that conventionally identifies a secret value. Such values must be loaded via `Config.redacted` or wrapped in `Schema.Redacted` so they stay redacted from logs and `toString`.'
	})
);

const isSecretKeyName = Schema.is(SecretKeyName);

const ConfigPrimitiveApi = Schema.Literals([
	'string',
	'nonEmptyString'
]).annotate({
	title: 'ConfigPrimitiveApi',
	description:
		'`Config.*` primitive string loaders whose secret-looking key names should switch to `Config.redacted` to keep the loaded value redacted from logs.'
});

const isConfigPrimitiveApi = Schema.is(ConfigPrimitiveApi);

const PlainStringSchemaName = Schema.Literals([
	'String',
	'NonEmptyString'
]).annotate({
	title: 'PlainStringSchemaName',
	description:
		'`Schema.String` and `Schema.NonEmptyString` — the unredacted shapes that should be wrapped in `Schema.Redacted(...)` when modelling secret-looking fields inside `Config.schema(...)`.'
});

const isPlainStringSchemaName = Schema.is(PlainStringSchemaName);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/**
 * Extract the static name of an object property's key. Identifier keys and
 * string-literal keys both qualify; computed and other shapes do not.
 */
const propertyKeyName = (
	prop: ESTree.ObjectProperty
): Option.Option<string> => {
	if (prop.computed) return Option.none();
	return pipe(
		AST.narrow(prop.key, 'Identifier'),
		Option.map((idNode) => idNode.name),
		Option.orElse(() =>
			pipe(
				AST.narrow(prop.key, 'Literal'),
				Option.flatMap((lit) =>
					P.isString(lit.value)
						? Option.some(lit.value)
						: Option.none<string>()
				)
			)
		)
	);
};

/**
 * Is the value a bare `Schema.String` / `Schema.NonEmptyString` member
 * access — i.e. not wrapped in `Schema.Redacted(...)` or piped through any
 * other helper? Anything more complex (call, pipe chain, identifier) is
 * left alone deliberately: this rule only flags the unambiguous shapes.
 */
const isPlainStringSchemaMember = (node: ESTree.Node): boolean =>
	pipe(
		AST.narrow(node, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Schema' && isPlainStringSchemaName(prop)
		)
	);

/**
 * Pull the `ObjectExpression` out of a `Config.schema(Schema.Struct({...}))`
 * shape. Returns `Option.none()` for any other arrangement (named schema
 * argument, non-Struct schema, computed args, etc.) so the rule only fires
 * on the literal-struct case it can statically analyse.
 */
const matchConfigSchemaStruct = (
	call: ESTree.CallExpression
): Option.Option<ESTree.ObjectExpression> =>
	pipe(
		AST.matchCallOf(call, 'Config', 'schema'),
		Option.flatMap((c) => Option.fromNullishOr(c.arguments[0])),
		Option.flatMap(AST.narrow('CallExpression')),
		Option.filter((inner) =>
			pipe(
				AST.narrow(inner.callee, 'MemberExpression'),
				Option.exists(AST.isMember('Schema', 'Struct'))
			)
		),
		Option.flatMap((inner) => Option.fromNullishOr(inner.arguments[0])),
		Option.flatMap(AST.narrow('ObjectExpression'))
	);

/**
 * Detection 1: `Config.string("API_KEY")` / `Config.nonEmptyString("TOKEN")`
 * — primitive loaders called with a secret-shaped key literal.
 */
const matchPrimitiveSecretCall = (
	call: ESTree.CallExpression
): Option.Option<readonly [apiName: string, key: string]> =>
	pipe(
		AST.narrow(call.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.filter(
			([obj, prop]) => obj === 'Config' && isConfigPrimitiveApi(prop)
		),
		Option.flatMap(([, apiName]) =>
			pipe(
				Option.fromNullishOr(call.arguments[0]),
				Option.flatMap(AST.narrow('Literal')),
				Option.flatMap((lit) =>
					P.isString(lit.value) && isSecretKeyName(lit.value)
						? Option.some([apiName, lit.value] as const)
						: Option.none<readonly [string, string]>()
				)
			)
		)
	);

/**
 * Detection 2: secret-shaped properties of a literal `Schema.Struct({...})`
 * argument to `Config.schema(...)`. Returns one `(property, key)` pair per
 * violating field so the diagnostic can land on the field itself.
 */
const findSecretSchemaFields = (
	struct: ESTree.ObjectExpression
): ReadonlyArray<readonly [ESTree.ObjectProperty, string]> =>
	pipe(
		struct.properties,
		Arr.filterMap((p) =>
			p.type !== 'Property'
				? Result.fail(undefined)
				: pipe(
						propertyKeyName(p),
						Option.filter(isSecretKeyName),
						Option.filter(() => isPlainStringSchemaMember(p.value)),
						Option.map((key) => [p, key] as const),
						Result.fromOption(() => undefined)
					)
		)
	);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const primitiveMessageFor = (apiName: string, key: string): string =>
	`Configuration key \`${key}\` looks like a secret. Use \`Config.redacted("${key}")\` instead of \`Config.${apiName}("${key}")\` so the loaded value stays redacted from logs and \`toString\`. (EF-29)`;

const schemaFieldMessageFor = (key: string): string =>
	`Field \`${key}\` inside \`Config.schema(...)\` looks like a secret. Wrap its inner schema in \`Schema.Redacted(...)\` (e.g. \`Schema.Redacted(Schema.String)\`) so the value stays redacted from logs and \`toString\`. (EF-29)`;

export default Rule.define({
	name: 'prefer-redacted-config',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag secret-shaped configuration values that escape redaction: `Config.string("API_KEY")` / `Config.nonEmptyString("TOKEN")` should use `Config.redacted`, and `Schema.String` / `Schema.NonEmptyString` fields inside `Config.schema(Schema.Struct({...}))` should be wrapped in `Schema.Redacted`.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		const reportPrimitive = (
			call: ESTree.CallExpression,
			apiName: string,
			key: string
		) =>
			ctx.report(
				Diagnostic.make({
					node: call,
					message: primitiveMessageFor(apiName, key)
				})
			);

		const reportSchemaField = (prop: ESTree.ObjectProperty, key: string) =>
			ctx.report(
				Diagnostic.make({
					node: prop,
					message: schemaFieldMessageFor(key)
				})
			);

		return Visitor.on('CallExpression', (node) =>
			Effect.gen(function* () {
				// Detection 1 — primitive loader with secret-shaped key literal.
				yield* pipe(
					matchPrimitiveSecretCall(node),
					Option.match({
						onNone: () => Effect.void,
						onSome: ([apiName, key]) =>
							reportPrimitive(node, apiName, key)
					})
				);

				// Detection 2 — secret-shaped fields inside a literal struct.
				yield* pipe(
					matchConfigSchemaStruct(node),
					Option.match({
						onNone: () => Effect.void,
						onSome: (struct) =>
							Effect.forEach(
								findSecretSchemaFields(struct),
								([prop, key]) => reportSchemaField(prop, key),
								{ concurrency: 1, discard: true }
							)
					})
				);
			})
		);
	}
});
