import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'prefer-arr-sort',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow native .sort() — use Arr.sort with explicit Order instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;
				if (
					call.callee.type !== 'MemberExpression' ||
					call.callee.property.type !== 'Identifier' ||
					call.callee.property.name !== 'sort'
				) {
					return Effect.void;
				}

				// Allow Arr.sort(...)
				if (
					call.callee.object.type === 'Identifier' &&
					call.callee.object.name === 'Arr'
				) {
					return Effect.void;
				}

				return ctx.report(
					Diagnostic.make({
						node,
						message:
							'Avoid native `.sort()`. Use `Arr.sort(items, order)` from `effect/Array` with an explicit `Order` for predictable, immutable sorting. (EF-38)'
					})
				);
			}
		};
	}
});
