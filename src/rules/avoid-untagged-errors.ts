import type { CreateRule, Visitor } from '@oxlint/plugins';

const ERROR_CONSTRUCTORS = new Set([
	'Error',
	'TypeError',
	'RangeError',
	'ReferenceError',
	'SyntaxError',
	'URIError',
	'EvalError',
	'AggregateError'
]);

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow new Error() / Error() and instanceof Error — use Schema.TaggedErrorClass instead'
		}
	},
	create(context) {
		return {
			NewExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					ERROR_CONSTRUCTORS.has(node.callee.name)
				) {
					context.report({
						node,
						message: `Avoid \`new ${node.callee.name}(...)\` in Effect code. Use \`Schema.TaggedErrorClass\` for typed, tagged errors that compose with \`catchTag\`/\`catchTags\`. (EF-1)`
					});
				}
			},
			CallExpression(node) {
				// Catch `Error("msg")` without `new`
				if (
					node.callee.type === 'Identifier' &&
					ERROR_CONSTRUCTORS.has(node.callee.name)
				) {
					context.report({
						node,
						message: `Avoid \`${node.callee.name}(...)\` in Effect code. Use \`Schema.TaggedErrorClass\` for typed, tagged errors that compose with \`catchTag\`/\`catchTags\`. (EF-1)`
					});
				}
			},
			BinaryExpression(node) {
				if (
					node.operator === 'instanceof' &&
					node.right.type === 'Identifier' &&
					ERROR_CONSTRUCTORS.has(node.right.name)
				) {
					context.report({
						node,
						message: `Avoid \`instanceof ${node.right.name}\` in Effect code. Use \`catchTag\`/\`catchTags\` with \`Schema.TaggedErrorClass\` for type-safe error discrimination. (EF-30)`
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
