import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'context-tag-extends',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow removed Context/Effect service APIs — use ServiceMap.Service (Effect v4)'
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
									'The `class *Tag extends Context.Tag` pattern was removed in Effect v4. Use `ServiceMap.Service` instead, and name the service directly (no *Tag suffix).'
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
									'`Context.GenericTag` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
							})
						);
					}

					// Flag bare `Context.Tag` usage
					if (AST.isMember(member, 'Context', 'Tag')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.Tag` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
							})
						);
					}

					// Flag bare `Effect.Service` usage
					if (AST.isMember(member, 'Effect', 'Service')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Effect.Service` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
							})
						);
					}

					// Flag `Context.Reference`
					if (AST.isMember(member, 'Context', 'Reference')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.Reference` was removed in Effect v4. Use `ServiceMap.Reference` instead.'
							})
						);
					}

					// Flag `Context.make`
					if (AST.isMember(member, 'Context', 'make')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.make` was removed in Effect v4. Use `ServiceMap.make` instead.'
							})
						);
					}

					// Flag `Context.get`
					if (AST.isMember(member, 'Context', 'get')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.get` was removed in Effect v4. Use `ServiceMap.get` instead.'
							})
						);
					}

					// Flag `Context.add`
					if (AST.isMember(member, 'Context', 'add')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.add` was removed in Effect v4. Use `ServiceMap.add` instead.'
							})
						);
					}

					// Flag `Context.mergeAll`
					if (AST.isMember(member, 'Context', 'mergeAll')) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Context.mergeAll` was removed in Effect v4. Use `ServiceMap.mergeAll` instead.'
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
										'`Effect.Service` was removed in Effect v4. Use `ServiceMap.Service` for service definitions instead.'
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
