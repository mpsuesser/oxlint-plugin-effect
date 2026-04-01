import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

/**
 * Effect APIs that accept a Duration or numeric milliseconds where
 * callers should use Duration constructors instead of raw numbers.
 * Entries: [object, property]
 */
const DURATION_APIS: ReadonlyArray<readonly [string, string]> = [
	['Effect', 'timeout'],
	['Effect', 'timeoutOption'],
	['Effect', 'timeoutOrElse'],
	['Effect', 'timeoutFail'],
	['Effect', 'timeoutFailCause'],
	['Effect', 'sleep'],
	['Effect', 'delay'],
	['Schedule', 'spaced'],
	['Schedule', 'fixed'],
	['Schedule', 'windowed'],
	['Schedule', 'duration'],
	['Schedule', 'intersect'],
	['Schedule', 'union']
];

export default Rule.define({
	name: 'prefer-duration-constructors',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Prefer Duration constructors over raw numeric literals for time values (EF-16)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;

				let matched = false;
				for (const [obj, prop] of DURATION_APIS) {
					if (AST.isCallOf(call, obj, prop)) {
						matched = true;
						break;
					}
				}
				if (!matched) return Effect.void;

				// Check all arguments for numeric literals and report each
				const reports: Array<Effect.Effect<void, never, RuleContext>> =
					[];
				for (const arg of call.arguments) {
					if (
						arg.type === 'Literal' &&
						typeof arg.value === 'number'
					) {
						reports.push(
							ctx.report(
								Diagnostic.make({
									node: arg,
									message: `Use \`Duration.millis(${arg.value})\` or \`Duration.seconds(...)\` instead of a raw numeric literal. Duration constructors are self-documenting and prevent unit confusion. (EF-16)`
								})
							)
						);
					}
				}

				if (reports.length === 0) return Effect.void;
				return Effect.all(reports, { discard: true });
			}
		};
	}
});
