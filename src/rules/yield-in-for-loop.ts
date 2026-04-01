import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'yield-in-for-loop',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow yield* inside for loops — use Effect.forEach for declarative effectful iteration'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const forLoopDepth = yield* Ref.make(0);

		return Visitor.merge(
			Visitor.tracked('ForStatement', () => true, forLoopDepth),
			Visitor.tracked('ForInStatement', () => true, forLoopDepth),
			Visitor.tracked('ForOfStatement', () => true, forLoopDepth),
			Visitor.on('YieldExpression', (node) =>
				Effect.gen(function* () {
					const depth = yield* Ref.get(forLoopDepth);
					const yieldNode = node as ESTree.YieldExpression;
					if (depth > 0 && yieldNode.delegate) {
						yield* ctx.report(
							Diagnostic.make({
								node,
								message:
									'Avoid `yield*` inside `for` loops. Use `Effect.forEach(items, fn, { concurrency: ... })` for declarative, parallelizable effectful iteration. (EF-5)'
							})
						);
					}
				})
			)
		);
	}
});
