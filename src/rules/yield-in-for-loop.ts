import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow yield* inside for loops — use Effect.forEach for declarative effectful iteration'
		}
	},
	create(context) {
		let forLoopDepth = 0;

		return {
			ForStatement() {
				forLoopDepth++;
			},
			'ForStatement:exit'() {
				forLoopDepth--;
			},
			ForInStatement() {
				forLoopDepth++;
			},
			'ForInStatement:exit'() {
				forLoopDepth--;
			},
			ForOfStatement() {
				forLoopDepth++;
			},
			'ForOfStatement:exit'() {
				forLoopDepth--;
			},

			YieldExpression(node) {
				if (forLoopDepth > 0 && node.delegate) {
					context.report({
						node,
						message:
							'Avoid `yield*` inside `for` loops. Use `Effect.forEach(items, fn, { concurrency: ... })` for declarative, parallelizable effectful iteration. (EF-5)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
