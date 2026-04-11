import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'context-tag-extends',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow removed Context/Effect service APIs and old ServiceMap aliases — use Context.Service and Context.* (Effect v4 beta.46)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			{
				ClassDeclaration: (node: ESTree.Node) => {
					const decl = node as ESTree.Class;
					// Flag `class FooTag extends Context.Tag<...>`
					if (
						decl.id &&
						decl.id.name.endsWith('Tag') &&
						decl.superClass &&
						decl.superClass.type === 'CallExpression' &&
						decl.superClass.callee.type === 'MemberExpression' &&
						AST.isMember(decl.superClass.callee, 'Context', 'Tag')
					) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'The `class *Tag extends Context.Tag` pattern was removed in Effect v4. Use `Context.Service` instead, and name the service directly (no *Tag suffix).'
							})
						);
					}
					return Effect.void;
				}
			},
			{
				MemberExpression: (node: ESTree.Node) => {
					const member = node as ESTree.MemberExpression;

					// Flag `Context.GenericTag<...>`
					if (AST.isMember(member, 'Context', 'GenericTag')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.GenericTag` was removed in Effect v4. Use `Context.Service` for service definitions instead.'
							})
						);
					}

					// Flag bare `Context.Tag` usage
					if (AST.isMember(member, 'Context', 'Tag')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.Tag` was removed in Effect v4. Use `Context.Service` for service definitions instead.'
							})
						);
					}

					// Flag bare `Effect.Service` usage
					if (AST.isMember(member, 'Effect', 'Service')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Effect.Service` was removed in Effect v4. Use `Context.Service` for service definitions instead.'
							})
						);
					}

					// Flag `ServiceMap.Service`
					if (AST.isMember(member, 'ServiceMap', 'Service')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.Service` was removed before Effect v4 beta.46 stabilized. Use `Context.Service` for service definitions instead.'
							})
						);
					}

					// Flag `ServiceMap.Reference`
					if (AST.isMember(member, 'ServiceMap', 'Reference')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.Reference` was removed before Effect v4 beta.46 stabilized. Use `Context.Reference` instead.'
							})
						);
					}

					// Flag `ServiceMap.make`
					if (AST.isMember(member, 'ServiceMap', 'make')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.make` was removed before Effect v4 beta.46 stabilized. Use `Context.make` instead.'
							})
						);
					}

					// Flag `ServiceMap.get`
					if (AST.isMember(member, 'ServiceMap', 'get')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.get` was removed before Effect v4 beta.46 stabilized. Use `Context.get` instead.'
							})
						);
					}

					// Flag `ServiceMap.add`
					if (AST.isMember(member, 'ServiceMap', 'add')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.add` was removed before Effect v4 beta.46 stabilized. Use `Context.add` instead.'
							})
						);
					}

					// Flag `ServiceMap.mergeAll`
					if (AST.isMember(member, 'ServiceMap', 'mergeAll')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`ServiceMap.mergeAll` was removed before Effect v4 beta.46 stabilized. Use `Context.mergeAll` instead.'
							})
						);
					}

					return Effect.void;
				}
			},
			{
				// Also catch `class X extends Effect.Service<X>()`
				CallExpression: (node: ESTree.Node) => {
					const call = node as ESTree.CallExpression;
					if (
						call.callee.type === 'CallExpression' &&
						call.callee.callee.type === 'MemberExpression' &&
						AST.isMember(call.callee.callee, 'Effect', 'Service')
					) {
						// Only flag if it's in a class extends position
						const { parent } = call;
						if (
							parent?.type === 'ClassDeclaration' ||
							parent?.type === 'ClassExpression'
						) {
							return ctx.report(
								Diagnostic.make({
									node,
									message:
										'`Effect.Service` was removed in Effect v4. Use `Context.Service` for service definitions instead.'
								})
							);
						}
					}
					return Effect.void;
				}
			}
		);
	}
});
