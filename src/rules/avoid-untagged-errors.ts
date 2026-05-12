/**
 * `new Error(...)` produces an untagged failure with no `_tag` discriminator
 * and no schema-validated shape — making it impossible to recover from
 * precisely via `catchTag`/`catchTags`. Likewise, `e instanceof Error` is
 * an opaque guard that doesn't narrow to a domain variant.
 *
 * Scope (matches pattern intent): only the bare `Error` constructor — not
 * subclasses like `TypeError` or `RangeError`. Those have legitimate uses
 * (`Effect.die(new TypeError(...))` for invariant violations) and the noise
 * isn't worth the marginal value.
 */

import { pipe } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const ErrorConstructor = Schema.Literal('Error').annotate({
	title: 'ErrorConstructor',
	description:
		'The bare global `Error` constructor — pattern EF-1 forbids using it for recoverable domain failures.'
});

const isErrorConstructor = Schema.is(ErrorConstructor);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const NEW_MESSAGE =
	'Avoid `new Error(...)` in Effect code. Use `Schema.TaggedErrorClass` for typed, tagged errors that compose with `catchTag`/`catchTags`. (EF-1)';

const INSTANCEOF_MESSAGE =
	'Avoid `instanceof Error` in Effect code. Use `catchTag`/`catchTags` with `Schema.TaggedErrorClass` for type-safe error discrimination. (EF-30)';

export default Rule.define({
	name: 'avoid-untagged-errors',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow `new Error(...)` and `<expr> instanceof Error` — use `Schema.TaggedErrorClass` instead (EF-1)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			// `new Error(...)` — flag the constructor expression itself.
			Visitor.on('NewExpression', (node) =>
				pipe(
					AST.narrow(node.callee, 'Identifier'),
					Option.map((id) => id.name),
					Option.filter(isErrorConstructor),
					Option.match({
						onNone: () => Effect.void,
						onSome: () =>
							ctx.report(
								Diagnostic.make({
									node,
									message: NEW_MESSAGE
								})
							)
					})
				)
			),
			// `<expr> instanceof Error` — the discriminator on the right.
			Visitor.on('BinaryExpression', (node) => {
				if (node.operator !== 'instanceof') return Effect.void;
				return pipe(
					AST.narrow(node.right, 'Identifier'),
					Option.map((id) => id.name),
					Option.filter(isErrorConstructor),
					Option.match({
						onNone: () => Effect.void,
						onSome: () =>
							ctx.report(
								Diagnostic.make({
									node,
									message: INSTANCEOF_MESSAGE
								})
							)
					})
				);
			})
		);
	}
});
