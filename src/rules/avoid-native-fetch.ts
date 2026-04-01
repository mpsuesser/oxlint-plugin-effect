import type { CreateRule, Visitor } from '@oxlint/plugins';

const MESSAGE =
	'Avoid native `fetch()` in Effect code. Use `HttpClientRequest`, `HttpClientResponse`, and `HttpClient` from Effect for typed errors, composable request building, and testability via layer substitution. (EF-9b)';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow native fetch() — use Effect HttpClient modules instead'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				// Match bare `fetch(...)`
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'fetch'
				) {
					context.report({ node, message: MESSAGE });
					return;
				}

				// Match `window.fetch(...)` and `globalThis.fetch(...)`
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.object.type === 'Identifier' &&
					(node.callee.object.name === 'window' ||
						node.callee.object.name === 'globalThis') &&
					node.callee.property.type === 'Identifier' &&
					node.callee.property.name === 'fetch'
				) {
					context.report({ node, message: MESSAGE });
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
