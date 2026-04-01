import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				"Disallow direct ._tag === '...' checks — use $is, $match, or Match for tagged union discrimination"
		}
	},
	create(context) {
		return {
			BinaryExpression(node) {
				if (node.operator !== '===' && node.operator !== '!==') return;

				// Check left side for `._tag` or `_tag` member access
				const isTagCheck =
					node.left.type === 'MemberExpression' &&
					node.left.property.type === 'Identifier' &&
					node.left.property.name === '_tag' &&
					(node.right.type === 'Literal' ||
						node.right.type === 'TemplateLiteral');

				// Also check reversed: `"Tag" === x._tag`
				const isReversedTagCheck =
					node.right.type === 'MemberExpression' &&
					node.right.property.type === 'Identifier' &&
					node.right.property.name === '_tag' &&
					(node.left.type === 'Literal' ||
						node.left.type === 'TemplateLiteral');

				if (isTagCheck || isReversedTagCheck) {
					context.report({
						node,
						message:
							'Avoid direct `._tag === "..."` checks. Use `$is("Tag")` for type guards, `$match` for exhaustive pattern matching, or `Match.value(...).pipe(Match.when(...))` for composable branching. (EF-7)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
