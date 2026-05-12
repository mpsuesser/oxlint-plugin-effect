/**
 * Flag the TypeScript non-null assertion operator (`expr!`).
 *
 * The `!` operator tells the compiler "trust me, this isn't null". When the
 * assertion is wrong, the program crashes at runtime with no recovery path.
 * Effect-first code models absence with `Option`, parses unknown shapes
 * with `Schema.decodeUnknown*`, and handles nullish input at boundaries with
 * `Option.fromNullishOr` — none of which `!` can express.
 *
 * The rule has no scope conditions: any `TSNonNullExpression` is suspicious.
 */

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

const MESSAGE =
	'Avoid the `!` non-null assertion — it tells the compiler "trust me" and crashes at runtime if wrong. Model absence with `Option`, decode unknown shapes via `Schema.decodeUnknown*`, or guard at the boundary with `Option.fromNullishOr` / `?.` / `??`. (EF-2)';

export default Rule.define({
	name: 'avoid-non-null-assertion',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow the `!` non-null assertion operator — model absence with `Option`, decode unknowns with `Schema`, and handle nullish at boundaries.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('TSNonNullExpression', (node) =>
			ctx.report(Diagnostic.make({ node, message: MESSAGE }))
		);
	}
});
