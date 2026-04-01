import type { CreateRule, Visitor } from '@oxlint/plugins';

const MESSAGE =
	'Avoid imperative loops in domain code. Use `Arr.map`, `Arr.filter`, `Arr.filterMap`, `Arr.reduce`, or `Effect.forEach` for functional, composable transformations. (EF-5)';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow for/for-in/for-of/while/do-while loops — use functional Array helpers or Effect.forEach'
		}
	},
	create(context) {
		return {
			ForStatement(node) {
				context.report({ node, message: MESSAGE });
			},
			ForInStatement(node) {
				context.report({ node, message: MESSAGE });
			},
			ForOfStatement(node) {
				context.report({ node, message: MESSAGE });
			},
			WhileStatement(node) {
				context.report({ node, message: MESSAGE });
			},
			DoWhileStatement(node) {
				context.report({ node, message: MESSAGE });
			}
		} satisfies Visitor;
	}
};

export default rule;
