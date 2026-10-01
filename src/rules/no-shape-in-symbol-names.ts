import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';
import { Rule, RuleContext, Visitor } from 'effect-oxlint';
import type { ESTree } from '@oxlint/plugins';

const isForbiddenLowercaseName = Schema.is(
	Schema.String.check(Schema.isIncluding('shape'))
);
const containsForbiddenSymbolName = (name: string) =>
	isForbiddenLowercaseName(Str.toLowerCase(name));

/** Return whether an identifier names a statically accessed member owned by another value. */
function isBorrowedMemberName(node: ESTree.Node): boolean {
	const parent = node.parent;
	if (parent === null || parent.type !== 'MemberExpression') return false;
	return parent.property === node && parent.computed === false;
}

/** Ban the case-insensitive substring "shape" in every JavaScript and TypeScript symbol name. */
export const noForbiddenTermInSymbolNamesRule = Rule.define({
	name: 'no-shape-in-symbol-names',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow the case-insensitive substring "shape" in JavaScript, TypeScript, private, and JSX symbol names.'
		},
		messages: {
			forbiddenSymbolName:
				'Rename symbol "{{name}}" for its domain role; "shape" describes structure rather than ownership.'
		}
	},
	create: function* () {
		const context = yield* RuleContext;
		const reportForbiddenSymbolName = Effect.fn(
			'no-shape-in-symbol-names.reportForbiddenSymbolName'
		)(function* (node: ESTree.Node & { name: string }) {
			if (
				!containsForbiddenSymbolName(node.name) ||
				isBorrowedMemberName(node)
			)
				return;
			yield* context.report({
				node,
				messageId: 'forbiddenSymbolName',
				data: { name: node.name }
			});
		});

		return Visitor.merge(
			Visitor.on('Identifier', reportForbiddenSymbolName),
			Visitor.on('PrivateIdentifier', reportForbiddenSymbolName),
			Visitor.on('JSXIdentifier', reportForbiddenSymbolName)
		);
	}
});

export default noForbiddenTermInSymbolNamesRule;
