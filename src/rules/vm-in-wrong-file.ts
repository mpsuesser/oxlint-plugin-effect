import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'vm-in-wrong-file',
	meta: Rule.meta({
		type: 'problem',
		description:
			'View Model definitions must be in .vm.ts files — detected VM pattern outside proper location'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return yield* Visitor.filter(
			(filename) =>
				!filename.endsWith('.vm.ts') && !filename.endsWith('.vm.tsx'),
			Visitor.merge(
				Visitor.on('TSInterfaceDeclaration', (node) => {
					const iface =
						node as unknown as ESTree.TSInterfaceDeclaration;
					if (iface.id.name.endsWith('VM')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message: `View Model interface \`${iface.id.name}\` must be in a \`.vm.ts\` file. Move it to \`${ctx.filename.replace(/\.(ts|tsx)$/, '.vm.$1')}\` to keep rendering and state management separated.`
							})
						);
					}
					return Effect.void;
				}),
				Visitor.on('CallExpression', (node) => {
					const call = node as ESTree.CallExpression;
					if (
						call.callee.type === 'MemberExpression' &&
						AST.isMember(call.callee, 'Layer', ['effect', 'scoped'])
					) {
						const firstArg = call.arguments[0];
						if (
							firstArg &&
							firstArg.type === 'Identifier' &&
							firstArg.name.endsWith('VM')
						) {
							const propName =
								call.callee.property.type === 'Identifier'
									? call.callee.property.name
									: 'effect';
							return ctx.report(
								Diagnostic.make({
									node,
									message: `View Model layer \`Layer.${propName}(${firstArg.name}, ...)\` must be in a \`.vm.ts\` file. Move it to keep rendering and state management separated.`
								})
							);
						}
					}
					return Effect.void;
				})
			)
		);
	}
});
