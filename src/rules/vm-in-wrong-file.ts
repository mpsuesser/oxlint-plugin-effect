import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'View Model definitions must be in .vm.ts files — detected VM pattern outside proper location'
		}
	},
	create(context) {
		const filename = context.filename;

		// Skip .vm.ts files — they're the correct location
		if (filename.endsWith('.vm.ts') || filename.endsWith('.vm.tsx')) {
			return {} satisfies Visitor;
		}

		return {
			TSInterfaceDeclaration(node) {
				// Flag `interface FooVM { ... }`
				if (node.id.name.endsWith('VM')) {
					context.report({
						node,
						message: `View Model interface \`${node.id.name}\` must be in a \`.vm.ts\` file. Move it to \`${filename.replace(/\.(ts|tsx)$/, '.vm.$1')}\` to keep rendering and state management separated.`
					});
				}
			},

			CallExpression(node) {
				// Flag `Layer.effect(FooVM, ...)` or `Layer.scoped(FooVM, ...)`
				if (
					node.callee.type === 'MemberExpression' &&
					node.callee.object.type === 'Identifier' &&
					node.callee.object.name === 'Layer' &&
					node.callee.property.type === 'Identifier' &&
					(node.callee.property.name === 'effect' ||
						node.callee.property.name === 'scoped')
				) {
					const firstArg = node.arguments[0];
					if (
						firstArg &&
						firstArg.type === 'Identifier' &&
						firstArg.name.endsWith('VM')
					) {
						context.report({
							node,
							message: `View Model layer \`Layer.${node.callee.property.name}(${firstArg.name}, ...)\` must be in a \`.vm.ts\` file. Move it to keep rendering and state management separated.`
						});
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
