import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const TYPEOF_MAP: Record<string, string> = {
	string: 'P.isString',
	number: 'P.isNumber',
	boolean: 'P.isBoolean',
	function: 'P.isFunction',
	bigint: 'P.isBigInt',
	symbol: 'P.isSymbol',
	undefined: 'P.isUndefined',
	object: 'P.isObject'
};

export default Rule.define({
	name: 'prefer-effect-is',
	meta: Rule.meta({
		type: 'suggestion',
		description: 'Prefer Effect Predicate helpers over typeof checks (EF-6)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			BinaryExpression: (node: ESTree.Node) => {
				const bin = node as ESTree.BinaryExpression;
				if (bin.operator !== '===' && bin.operator !== '!==') {
					return Effect.void;
				}

				// Match: typeof x === "string" or "string" === typeof x
				let typeofArg: string | undefined;

				const { left, right } = bin;

				if (
					left.type === 'UnaryExpression' &&
					left.operator === 'typeof' &&
					right.type === 'Literal' &&
					typeof right.value === 'string'
				) {
					typeofArg = right.value;
				} else if (
					right.type === 'UnaryExpression' &&
					right.operator === 'typeof' &&
					left.type === 'Literal' &&
					typeof left.value === 'string'
				) {
					typeofArg = left.value;
				}

				if (!typeofArg) return Effect.void;
				const predicate = TYPEOF_MAP[typeofArg];
				if (!predicate) return Effect.void;

				return ctx.report(
					Diagnostic.make({
						node,
						message: `Use \`${predicate}(x)\` instead of \`typeof x ${bin.operator} "${typeofArg}"\`. Effect Predicate helpers are composable and type-safe. (EF-6)`
					})
				);
			}
		};
	}
});
