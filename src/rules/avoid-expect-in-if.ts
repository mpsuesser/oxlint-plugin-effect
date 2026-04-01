import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-expect-in-if',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow expect() inside if blocks in tests — use assert to narrow types and fail fast'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const ifBlockDepth = yield* Ref.make(0);

		return Visitor.merge(
			Visitor.tracked('IfStatement', () => true, ifBlockDepth),
			Visitor.on('CallExpression', (node) =>
				Effect.gen(function* () {
					const depth = yield* Ref.get(ifBlockDepth);
					if (depth <= 0) return;
					const call = node as ESTree.CallExpression;
					if (
						call.callee.type === 'Identifier' &&
						call.callee.name === 'expect'
					) {
						yield* ctx.report(
							Diagnostic.make({
								node,
								message:
									'Avoid `expect()` inside `if` blocks — the test silently passes when the condition is false. Use `assert` or `expect(...).toBeDefined()` to narrow types and fail fast.'
							})
						);
					}
				})
			)
		);
	}
});
