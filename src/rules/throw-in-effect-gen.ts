import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

export default Rule.define({
	name: 'throw-in-effect-gen',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow throw statements inside Effect.gen — use yield* Effect.fail() instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const effectGenDepth = yield* Ref.make(0);
		const tryPropertyDepth = yield* Ref.make(0);

		/**
		 * Check if a Property node is the `try` key inside
		 * Effect.tryPromise({ try: ..., catch: ... }) or Effect.try({ try: ... }).
		 */
		const isTryPropertyOfEffectTry = (node: ESTree.Node): boolean => {
			const prop = node as unknown as ESTree.ObjectProperty;
			if (prop.key.type !== 'Identifier' || prop.key.name !== 'try') {
				return false;
			}
			const parent = (prop as unknown as { parent?: ESTree.Node }).parent;
			if (parent?.type !== 'ObjectExpression') return false;
			const grandparent = (parent as unknown as { parent?: ESTree.Node })
				.parent;
			if (grandparent?.type !== 'CallExpression') return false;
			const call = grandparent as ESTree.CallExpression;
			return (
				AST.isCallOf(call, 'Effect', 'tryPromise') ||
				AST.isCallOf(call, 'Effect', 'try')
			);
		};

		return Visitor.merge(
			Visitor.tracked(
				'CallExpression',
				(node) => {
					const call = node as ESTree.CallExpression;
					return AST.isCallOf(call, 'Effect', 'gen');
				},
				effectGenDepth
			),
			{
				Property: (node: ESTree.Node) =>
					isTryPropertyOfEffectTry(node)
						? Ref.update(tryPropertyDepth, (n) => n + 1)
						: Effect.void,
				'Property:exit': (node: ESTree.Node) =>
					isTryPropertyOfEffectTry(node)
						? Ref.update(tryPropertyDepth, (n) => n - 1)
						: Effect.void
			},
			Visitor.on('ThrowStatement', (node) =>
				Effect.gen(function* () {
					const genDepth = yield* Ref.get(effectGenDepth);
					const tryDepth = yield* Ref.get(tryPropertyDepth);
					if (genDepth > 0 && tryDepth === 0) {
						yield* ctx.report(
							Diagnostic.make({
								node,
								message:
									'Do not throw inside `Effect.gen`. Use `yield* Effect.fail(new MyError(...))` to keep errors in the typed channel. (EF-1)'
							})
						);
					}
				})
			)
		);
	}
});
