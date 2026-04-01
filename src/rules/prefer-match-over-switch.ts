import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow switch statements — use Effect Match for exhaustive, composable branching'
		}
	},
	create(context) {
		return {
			SwitchStatement(node) {
				context.report({
					node,
					message:
						'Avoid `switch` statements in Effect code. Use `Match.value(...).pipe(Match.when(...), ..., Match.exhaustive)` for exhaustive, type-safe branching. (EF-7)'
				});
			}
		} satisfies Visitor;
	}
};

export default rule;
