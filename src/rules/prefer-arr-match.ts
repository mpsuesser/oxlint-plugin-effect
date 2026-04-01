import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Prefer Arr.match for empty/non-empty array branching (EF-7)'
		}
	},
	create(context) {
		return {
			BinaryExpression(node) {
				// Match: x.length === 0, x.length !== 0, x.length > 0, x.length < 1
				const { left, right, operator } = node;

				const isLengthAccess = (
					n: ESTree.Expression | ESTree.PrivateIdentifier
				): boolean =>
					n.type === 'MemberExpression' &&
					n.property.type === 'Identifier' &&
					n.property.name === 'length';

				const isZero = (
					n: ESTree.Expression | ESTree.PrivateIdentifier
				): boolean => n.type === 'Literal' && n.value === 0;

				const isOne = (
					n: ESTree.Expression | ESTree.PrivateIdentifier
				): boolean => n.type === 'Literal' && n.value === 1;

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
					context.report({
						node,
						message:
							'Use `Arr.match(array, { onEmpty: () => ..., onNonEmpty: (values) => ... })` instead of manual length checks for empty/non-empty branching. (EF-7)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
