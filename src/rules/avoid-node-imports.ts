import type { CreateRule, Visitor } from '@oxlint/plugins';

// Sources already handled by more specific use-*-service rules.
// Exclude these to avoid duplicate diagnostics.
const SPECIFIC_SOURCES = new Set([
	'node:fs',
	'node:fs/promises',
	'node:path',
	'node:os',
	'node:child_process',
	'node:http',
	'node:https'
]);

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow node:* imports not covered by specific rules — use @effect/platform abstractions'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const src = node.source.value;
				if (src.startsWith('node:') && !SPECIFIC_SOURCES.has(src)) {
					context.report({
						node,
						message:
							'Avoid `node:*` imports in domain code. Use `@effect/platform` abstractions (`FileSystem`, `Path`, `CommandExecutor`, `HttpClient`) for portable, testable code. (EF-41)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
