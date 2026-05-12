/**
 * `throw` inside `Effect.gen` / `Effect.fn` / `Effect.fnUntraced` produces a
 * defect, not a typed error — it bypasses the entire Effect error channel.
 * Use `yield* Effect.fail(...)` (or `yield* new MyTaggedError({...})`) so the
 * failure stays catchable by `Effect.catchTag`.
 *
 * Exemption: `throw` inside the `try:` callback of `Effect.try(...)` /
 * `Effect.tryPromise(...)` is fine — the paired `catch:` handler captures
 * it back into the typed error channel. We track that scope and suppress
 * diagnostics while we're inside it.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const EffectGenLikeName = Schema.Literals(['gen', 'fn', 'fnUntraced']).annotate(
	{
		title: 'EffectGenLikeName',
		description:
			'`Effect.*` constructors whose body uses generator syntax — `throw` inside any of these escapes the typed error channel.'
	}
);

const isEffectGenLikeName = Schema.is(EffectGenLikeName);

const EffectTryName = Schema.Literals(['try', 'tryPromise']).annotate({
	title: 'EffectTryName',
	description:
		'`Effect.try` and `Effect.tryPromise` accept a `try:` callback whose thrown errors are captured by the paired `catch:` handler.'
});

const isEffectTryName = Schema.is(EffectTryName);

// ---------------------------------------------------------------------------
// Parent-chain navigation — oxlint's ESTree types already carry
// `parent: Node | null` on every node, so a direct lift via
// `Option.fromNullishOr` is all we need.
// ---------------------------------------------------------------------------

/** The direct `.parent` of a node, lifted into `Option<ESTree.Node>`. */
const parent = (node: ESTree.Node): Option.Option<ESTree.Node> =>
	Option.fromNullishOr(node.parent);

/**
 * The direct parent, narrowed to a specific node `type`. Unlike
 * `AST.findAncestor` (which walks the whole chain), this only succeeds
 * when the immediate parent matches — so a property named `try` sitting
 * inside an unrelated object literal nested deeper inside `Effect.try`
 * does not get a false exemption.
 */
const parentOfType = <T extends string>(
	node: ESTree.Node,
	type: T
): Option.Option<ESTree.Node & { readonly type: T }> =>
	pipe(parent(node), Option.flatMap(AST.narrow(type)));

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/** A call of the form `Effect.gen(...)` / `Effect.fn(...)` / `Effect.fnUntraced(...)`. */
const isEffectGenLikeCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Effect' && isEffectGenLikeName(prop)
		)
	);

/**
 * A `Property` whose key is the identifier `try`, sitting as a direct
 * key of an `ObjectExpression` that is itself the direct argument of a
 * `CallExpression` whose callee is `Effect.try` / `Effect.tryPromise`.
 */
const isTryPropertyOfEffectTry = (node: ESTree.Node): boolean => {
	const isTryKey = pipe(
		AST.narrow(node, 'Property'),
		Option.exists(
			(p) => p.key.type === 'Identifier' && p.key.name === 'try'
		)
	);
	if (!isTryKey) return false;
	return pipe(
		parentOfType(node, 'ObjectExpression'),
		Option.flatMap((obj) => parentOfType(obj, 'CallExpression')),
		Option.flatMap((call) =>
			pipe(
				AST.narrow(call.callee, 'MemberExpression'),
				Option.flatMap(AST.memberNames)
			)
		),
		Option.exists(
			([obj, prop]) => obj === 'Effect' && isEffectTryName(prop)
		)
	);
};

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const MESSAGE =
	'Do not throw inside `Effect.gen` / `Effect.fn` / `Effect.fnUntraced`. Use `yield* Effect.fail(new MyError(...))` (or `yield* new MyTaggedError({...})`) to keep errors in the typed channel. (EF-1)';

export default Rule.define({
	name: 'throw-in-effect-gen',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow `throw` inside `Effect.gen` / `Effect.fn` / `Effect.fnUntraced` — use `yield* Effect.fail(...)` so the failure stays in the typed error channel. Throws inside the `try:` callback of `Effect.try` / `Effect.tryPromise` are exempt.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const generatorDepth = yield* Ref.make(0);
		const tryPropertyDepth = yield* Ref.make(0);

		return Visitor.merge(
			Visitor.tracked(
				'CallExpression',
				isEffectGenLikeCall,
				generatorDepth
			),
			Visitor.tracked(
				'Property',
				isTryPropertyOfEffectTry,
				tryPropertyDepth
			),
			Visitor.on('ThrowStatement', (node) =>
				Effect.gen(function* () {
					const gen = yield* Ref.get(generatorDepth);
					const tryDepth = yield* Ref.get(tryPropertyDepth);
					if (gen > 0 && tryDepth === 0) {
						yield* ctx.report(
							Diagnostic.make({ node, message: MESSAGE })
						);
					}
				})
			)
		);
	}
});
