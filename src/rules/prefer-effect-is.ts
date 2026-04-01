import type { CreateRule, Visitor } from '@oxlint/plugins';

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

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Prefer Effect Predicate helpers over typeof checks (EF-6)'
		}
	},
	create(context) {
		return {
			BinaryExpression(node) {
				if (node.operator !== '===' && node.operator !== '!==') return;

				// Match: typeof x === "string" or "string" === typeof x
				let typeofArg: string | undefined;

				const { left, right } = node;

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

				if (!typeofArg) return;
				const predicate = TYPEOF_MAP[typeofArg];
				if (!predicate) return;

				context.report({
					node,
					message: `Use \`${predicate}(x)\` instead of \`typeof x ${node.operator} "${typeofArg}"\`. Effect Predicate helpers are composable and type-safe. (EF-6)`
				});
			}
		} satisfies Visitor;
	}
};

export default rule;
