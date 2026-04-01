import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow @effect/platform-bun imports in binding packages — use @effect/platform abstractions'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const src = node.source.value;
				if (
					src === '@effect/platform-bun' ||
					src.startsWith('@effect/platform-bun/')
				) {
					context.report({
						node,
						message:
							'Binding packages must be platform-agnostic. Import from `@effect/platform` (abstract interfaces) instead of `@effect/platform-bun` (concrete implementations). Platform layers belong in the runtime entry point.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
