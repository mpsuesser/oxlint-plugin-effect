import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-object-type',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow Object and {} as types — use Record, Schema, or specific interfaces'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			Visitor.on('TSTypeReference', (node: ESTree.Node) => {
				const ref = node as ESTree.TSTypeReference;
				if (
					ref.typeName.type === 'Identifier' &&
					ref.typeName.name === 'Object'
				) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Avoid using `Object` as a type — it provides no type safety. Use a specific interface, `Record<string, unknown>`, or a `Schema.Class`.'
						})
					);
				}
				return Effect.void;
			}),
			Visitor.on('TSTypeLiteral', (node: ESTree.Node) => {
				const lit = node as ESTree.TSTypeLiteral;
				if (lit.members.length === 0) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Avoid using `{}` as a type — it matches any non-nullish value. Use `Record<string, never>` for an empty object, or a specific interface.'
						})
					);
				}
				return Effect.void;
			})
		);
	}
});
