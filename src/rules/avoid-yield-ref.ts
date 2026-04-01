import type { CreateRule, Visitor } from '@oxlint/plugins';

const DIRECT_YIELD_TARGETS = new Set(['ref', 'deferred', 'fiber', 'latch']);

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow yield* on Ref/Deferred/Fiber/Latch — use explicit method calls in Effect v4'
		}
	},
	create(context) {
		return {
			YieldExpression(node) {
				if (!node.delegate || !node.argument) return;

				// Check `yield* ref` / `yield* deferred` / etc.
				if (
					node.argument.type === 'Identifier' &&
					DIRECT_YIELD_TARGETS.has(node.argument.name.toLowerCase())
				) {
					context.report({
						node,
						message: `Direct \`yield* ${node.argument.name}\` was removed in Effect v4. Use explicit method calls instead: \`Ref.get(ref)\`, \`Deferred.await(deferred)\`, \`Fiber.join(fiber)\`, \`Latch.await(latch)\`. (EF-8)`
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
