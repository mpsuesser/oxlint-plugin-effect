import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow expect() inside if blocks in tests — use assert to narrow types and fail fast'
		}
	},
	create(context) {
		let ifBlockDepth = 0;

		return {
			IfStatement() {
				ifBlockDepth++;
			},
			'IfStatement:exit'() {
				ifBlockDepth--;
			},

			CallExpression(node) {
				if (
					ifBlockDepth > 0 &&
					node.callee.type === 'Identifier' &&
					node.callee.name === 'expect'
				) {
					context.report({
						node,
						message:
							'Avoid `expect()` inside `if` blocks — the test silently passes when the condition is false. Use `assert` or `expect(...).toBeDefined()` to narrow types and fail fast.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
