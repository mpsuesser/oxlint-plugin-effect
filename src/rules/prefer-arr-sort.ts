import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow native .sort() — use Arr.sort with explicit Order instead'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.type !== 'MemberExpression' ||
					node.callee.property.type !== 'Identifier' ||
					node.callee.property.name !== 'sort'
				)
					return;

				// Allow Arr.sort(...)
				if (
					node.callee.object.type === 'Identifier' &&
					node.callee.object.name === 'Arr'
				)
					return;

				context.report({
					node,
					message:
						'Avoid native `.sort()`. Use `Arr.sort(items, order)` from `effect/Array` with an explicit `Order` for predictable, immutable sorting. (EF-38)'
				});
			}
		} satisfies Visitor;
	}
};

export default rule;
