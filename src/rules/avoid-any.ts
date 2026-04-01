import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-any',
	meta: Rule.meta({
		type: 'suggestion',
		description: 'Disallow `as any` and `as unknown as T` type assertions'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			TSAsExpression: (node: ESTree.Node) => {
				const tsAs = node as ESTree.TSAsExpression;

				// Flag `as any`
				if (tsAs.typeAnnotation.type === 'TSAnyKeyword') {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Avoid `as any` — it erases type safety. Use `Schema.decodeUnknown*` to validate unknown data, generics to preserve types, or fix the upstream type. (EF-3)'
						})
					);
				}

				// Flag `expr as unknown as T` — the inner `as unknown` step
				if (
					tsAs.typeAnnotation.type === 'TSUnknownKeyword' &&
					tsAs.parent.type === 'TSAsExpression'
				) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Avoid `as unknown as T` — casting through unknown erases type information. Use `Schema.decodeUnknown*` to validate data, or fix the upstream type.'
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
