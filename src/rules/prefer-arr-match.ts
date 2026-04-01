import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const isLengthAccess = (
	n: ESTree.Expression | ESTree.PrivateIdentifier
): boolean =>
	n.type === 'MemberExpression' &&
	n.property.type === 'Identifier' &&
	n.property.name === 'length';

const isZero = (n: ESTree.Expression | ESTree.PrivateIdentifier): boolean =>
	n.type === 'Literal' && n.value === 0;

const isOne = (n: ESTree.Expression | ESTree.PrivateIdentifier): boolean =>
	n.type === 'Literal' && n.value === 1;

export default Rule.define({
	name: 'prefer-arr-match',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Prefer Arr.match for empty/non-empty array branching (EF-7)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			BinaryExpression: (node: ESTree.Node) => {
				const bin = node as ESTree.BinaryExpression;
				const { left, right, operator } = bin;

				// x.length === 0  |  x.length !== 0  |  x.length > 0  |  x.length >= 1  |  0 === x.length
				const match =
					(isLengthAccess(left) &&
						isZero(right) &&
						(operator === '===' ||
							operator === '!==' ||
							operator === '>' ||
							operator === '==' ||
							operator === '!=')) ||
					(isZero(left) &&
						isLengthAccess(right) &&
						(operator === '===' ||
							operator === '!==' ||
							operator === '<' ||
							operator === '==' ||
							operator === '!=')) ||
					(isLengthAccess(left) &&
						isOne(right) &&
						(operator === '>=' || operator === '<')) ||
					(isOne(left) &&
						isLengthAccess(right) &&
						(operator === '<=' || operator === '>'));

				if (match) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Use `Arr.match(array, { onEmpty: () => ..., onNonEmpty: (values) => ... })` instead of manual length checks for empty/non-empty branching. (EF-7)'
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
