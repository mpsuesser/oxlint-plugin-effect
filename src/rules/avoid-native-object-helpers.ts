import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-native-object-helpers',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow native Object.keys/values/entries and new Map/Set — use Effect modules (EF-5)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return Visitor.merge(
			Visitor.on('MemberExpression', (node) => {
				const member = node as ESTree.MemberExpression;
				if (AST.isMember(member, 'Object', 'keys')) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `R.keys(obj)` from `effect/Record` instead of `Object.keys(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
						})
					);
				}
				if (AST.isMember(member, 'Object', 'values')) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `R.values(obj)` from `effect/Record` instead of `Object.values(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
						})
					);
				}
				if (AST.isMember(member, 'Object', 'entries')) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `R.toEntries(obj)` from `effect/Record` instead of `Object.entries(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
						})
					);
				}
				if (AST.isMember(member, 'Object', 'fromEntries')) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `R.fromEntries(entries)` from `effect/Record` instead of `Object.fromEntries(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
						})
					);
				}
				return Effect.void;
			}),
			Visitor.on('NewExpression', (node) => {
				const newExpr = node as ESTree.NewExpression;
				if (newExpr.callee.type !== 'Identifier') {
					return Effect.void;
				}
				const name = newExpr.callee.name;
				if (name === 'Map') {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `HashMap` from `effect/HashMap` instead of native `Map`. HashMap provides structural equality and immutability. (EF-5)'
						})
					);
				}
				if (name === 'Set') {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `HashSet` from `effect/HashSet` instead of native `Set`. HashSet provides structural equality and immutability. (EF-5)'
						})
					);
				}
				return Effect.void;
			})
		);
	}
});
