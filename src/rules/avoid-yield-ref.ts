import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const DIRECT_YIELD_TARGETS = new Set(['ref', 'deferred', 'fiber', 'latch']);

export default Rule.define({
	name: 'avoid-yield-ref',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow yield* on Ref/Deferred/Fiber/Latch — use explicit method calls in Effect v4'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			YieldExpression: (node: ESTree.Node) => {
				const expr = node as ESTree.YieldExpression;
				if (!expr.delegate || !expr.argument) {
					return Effect.void;
				}

				if (
					expr.argument.type === 'Identifier' &&
					DIRECT_YIELD_TARGETS.has(expr.argument.name.toLowerCase())
				) {
					return ctx.report(
						Diagnostic.make({
							node,
							message: `Direct \`yield* ${expr.argument.name}\` was removed in Effect v4. Use explicit method calls instead: \`Ref.get(ref)\`, \`Deferred.await(deferred)\`, \`Fiber.join(fiber)\`, \`Latch.await(latch)\`. (EF-8)`
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
