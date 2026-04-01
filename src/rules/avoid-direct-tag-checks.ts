import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-direct-tag-checks',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			"Disallow direct ._tag === '...' checks — use $is, $match, or Match for tagged union discrimination"
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			BinaryExpression: (node: ESTree.Node) => {
				const bin = node as ESTree.BinaryExpression;
				if (bin.operator !== '===' && bin.operator !== '!==') {
					return Effect.void;
				}

				// Check left side for `._tag` member access
				const isTagCheck =
					bin.left.type === 'MemberExpression' &&
					bin.left.property.type === 'Identifier' &&
					bin.left.property.name === '_tag' &&
					(bin.right.type === 'Literal' ||
						bin.right.type === 'TemplateLiteral');

				// Also check reversed: `"Tag" === x._tag`
				const isReversedTagCheck =
					bin.right.type === 'MemberExpression' &&
					bin.right.property.type === 'Identifier' &&
					bin.right.property.name === '_tag' &&
					(bin.left.type === 'Literal' ||
						bin.left.type === 'TemplateLiteral');

				if (isTagCheck || isReversedTagCheck) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Avoid direct `._tag === "..."` checks. Use `$is("Tag")` for type guards, `$match` for exhaustive pattern matching, or `Match.value(...).pipe(Match.when(...))` for composable branching. (EF-7)'
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
