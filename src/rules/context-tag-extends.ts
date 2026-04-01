import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isMemberExpr } from '../utils.ts';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow removed Context/Effect service APIs — use ServiceMap.Service (Effect v4)'
		}
	},
	create(context) {
		return {
			ClassDeclaration(node) {
				// Flag `class FooTag extends Context.Tag<...>`
				if (
					node.id &&
					node.id.name.endsWith('Tag') &&
					node.superClass &&
					node.superClass.type === 'CallExpression' &&
					node.superClass.callee.type === 'MemberExpression' &&
					isMemberExpr(node.superClass.callee, 'Context', 'Tag')
				) {
					context.report({
						node,
						message:
							'The `class *Tag extends Context.Tag` pattern was removed in Effect v4. Use `ServiceMap.Service` instead, and name the service directly (no *Tag suffix).'
					});
				}
			},
			MemberExpression(node) {
				// Flag `Context.GenericTag<...>`
				if (isMemberExpr(node, 'Context', 'GenericTag')) {
					context.report({
						node,
						message:
							'`Context.GenericTag` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
					});
				}

				// Flag bare `Context.Tag` usage (non-class-extends positions)
				if (isMemberExpr(node, 'Context', 'Tag')) {
					context.report({
						node,
						message:
							'`Context.Tag` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
					});
				}

				// Flag bare `Effect.Service` usage (non-class-extends positions)
				if (isMemberExpr(node, 'Effect', 'Service')) {
					context.report({
						node,
						message:
							'`Effect.Service` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
					});
				}

				// Flag `Context.Reference` — replaced by ServiceMap.Reference
				if (isMemberExpr(node, 'Context', 'Reference')) {
					context.report({
						node,
						message:
							'`Context.Reference` was removed in Effect v4. Use `ServiceMap.Reference` instead.'
					});
				}

				// Flag `Context.make` — replaced by ServiceMap.make
				if (isMemberExpr(node, 'Context', 'make')) {
					context.report({
						node,
						message:
							'`Context.make` was removed in Effect v4. Use `ServiceMap.make` instead.'
					});
				}

				// Flag `Context.get` — replaced by ServiceMap.get
				if (isMemberExpr(node, 'Context', 'get')) {
					context.report({
						node,
						message:
							'`Context.get` was removed in Effect v4. Use `ServiceMap.get` instead.'
					});
				}

				// Flag `Context.add` — replaced by ServiceMap.add
				if (isMemberExpr(node, 'Context', 'add')) {
					context.report({
						node,
						message:
							'`Context.add` was removed in Effect v4. Use `ServiceMap.add` instead.'
					});
				}

				// Flag `Context.mergeAll` — replaced by ServiceMap.mergeAll
				if (isMemberExpr(node, 'Context', 'mergeAll')) {
					context.report({
						node,
						message:
							'`Context.mergeAll` was removed in Effect v4. Use `ServiceMap.mergeAll` instead.'
					});
				}
			},
			// Also catch `class X extends Effect.Service<X>()`
			CallExpression(node) {
				if (
					node.callee.type === 'CallExpression' &&
					node.callee.callee.type === 'MemberExpression' &&
					isMemberExpr(node.callee.callee, 'Effect', 'Service')
				) {
					// Only flag if it's in a class extends position
					const { parent } = node;
					if (
						parent?.type === 'ClassDeclaration' ||
						parent?.type === 'ClassExpression'
					) {
						context.report({
							node,
							message:
								'`Effect.Service` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
						});
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
