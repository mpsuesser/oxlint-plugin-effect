import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'prefer-option-over-null',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag | null and | undefined in type unions — consider using Option<T> instead for explicit absence modeling (EF-2)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			TSUnionType: (node: ESTree.Node) => {
				const union = node as ESTree.TSUnionType;
				const hasNull = union.types.some(
					(t) => t.type === 'TSNullKeyword'
				);
				const hasUndefined = union.types.some(
					(t) => t.type === 'TSUndefinedKeyword'
				);

				if (hasNull && hasUndefined) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Consider using `Option<T>` instead of `T | null | undefined` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
						})
					);
				} else if (hasNull) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Consider using `Option<T>` instead of `T | null` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
						})
					);
				} else if (hasUndefined) {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Consider using `Option<T>` instead of `T | undefined` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
