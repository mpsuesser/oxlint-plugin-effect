import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow try-catch blocks in Effect code — use Effect.try or typed errors instead'
		}
	},
	create(context) {
		return {
			TryStatement(node) {
				context.report({
					node,
					message:
						'Avoid try-catch in Effect code. Use `Effect.try` or `Effect.tryPromise` with `Schema.TaggedErrorClass` for typed, composable error handling. (EF-1)'
				});
			}
		} satisfies Visitor;
	}
};

export default rule;
