import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isCallOfMember } from '../utils.ts';

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

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Prefer Duration constructors over raw numeric literals for time values (EF-16)'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				for (const [obj, prop] of DURATION_APIS) {
					if (!isCallOfMember(node, obj, prop)) continue;

					// Check first argument (or second for timeoutOrElse-style APIs)
					for (const arg of node.arguments) {
						if (
							arg.type === 'Literal' &&
							typeof arg.value === 'number'
						) {
							context.report({
								node: arg,
								message: `Use \`Duration.millis(${arg.value})\` or \`Duration.seconds(...)\` instead of a raw numeric literal. Duration constructors are self-documenting and prevent unit confusion. (EF-16)`
							});
						}
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
