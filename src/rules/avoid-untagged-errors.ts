import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

const ERROR_CONSTRUCTORS = new Set([
	'Error',
	'TypeError',
	'RangeError',
	'ReferenceError',
	'SyntaxError',
	'URIError',
	'EvalError',
	'AggregateError'
]);

export default Rule.define({
	name: 'avoid-untagged-errors',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow new Error() / Error() and instanceof Error — use Schema.TaggedErrorClass instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			Visitor.on('NewExpression', (node: ESTree.Node) => {
				const expr = node as ESTree.NewExpression;
				if (
					expr.callee.type === 'Identifier' &&
					ERROR_CONSTRUCTORS.has(expr.callee.name)
				) {
					return ctx.report(
						Diagnostic.make({
							node,
							message: `Avoid \`new ${expr.callee.name}(...)\` in Effect code. Use \`Schema.TaggedErrorClass\` for typed, tagged errors that compose with \`catchTag\`/\`catchTags\`. (EF-1)`
						})
					);
				}
				return Effect.void;
			}),
			Visitor.on('CallExpression', (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;
				return Option.match(AST.calleeName(call), {
					onNone: () => Effect.void,
					onSome: (name) =>
						ERROR_CONSTRUCTORS.has(name)
							? ctx.report(
									Diagnostic.make({
										node,
										message: `Avoid \`${name}(...)\` in Effect code. Use \`Schema.TaggedErrorClass\` for typed, tagged errors that compose with \`catchTag\`/\`catchTags\`. (EF-1)`
									})
								)
							: Effect.void
				});
			}),
			Visitor.on('BinaryExpression', (node: ESTree.Node) => {
				const bin = node as ESTree.BinaryExpression;
				if (
					bin.operator === 'instanceof' &&
					bin.right.type === 'Identifier' &&
					ERROR_CONSTRUCTORS.has(bin.right.name)
				) {
					return ctx.report(
						Diagnostic.make({
							node,
							message: `Avoid \`instanceof ${bin.right.name}\` in Effect code. Use \`catchTag\`/\`catchTags\` with \`Schema.TaggedErrorClass\` for type-safe error discrimination. (EF-30)`
						})
					);
				}
				return Effect.void;
			})
		);
	}
});
