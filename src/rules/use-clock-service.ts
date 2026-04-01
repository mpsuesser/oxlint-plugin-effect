import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

const MESSAGE =
	'Avoid direct `Date` usage in Effect code. Use `DateTime` from `effect` or the `Clock` service for testable, deterministic time operations. (EF-9)';

export default Rule.define({
	name: 'use-clock-service',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow new Date() and Date.* — use Effect DateTime/Clock service instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			{
				NewExpression: (node: ESTree.Node) => {
					const expr = node as ESTree.NewExpression;
					// Only flag `new Date()` (current time). `new Date(value)` is
					// a conversion/parse operation and is legitimate.
					if (
						expr.callee.type === 'Identifier' &&
						expr.callee.name === 'Date' &&
						expr.arguments.length === 0
					) {
						return ctx.report(
							Diagnostic.make({ node, message: MESSAGE })
						);
					}
					return Effect.void;
				}
			},
			{
				MemberExpression: (node: ESTree.Node) => {
					const member = node as ESTree.MemberExpression;
					if (
						AST.isMember(member, 'Date', 'now') ||
						AST.isMember(member, 'Date', 'parse') ||
						AST.isMember(member, 'Date', 'UTC')
					) {
						return ctx.report(
							Diagnostic.make({ node, message: MESSAGE })
						);
					}
					return Effect.void;
				}
			}
		);
	}
});
