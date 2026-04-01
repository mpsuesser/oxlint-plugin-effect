import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'casting-awareness',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag type assertions (as T) — verify the cast is necessary or improve upstream types'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			TSAsExpression: (node: ESTree.Node) => {
				const tsAs = node as ESTree.TSAsExpression;

				// Skip `as const`
				if (tsAs.typeAnnotation.type === 'TSTypeReference') {
					const name = tsAs.typeAnnotation.typeName;
					if (name.type === 'Identifier' && name.name === 'const') {
						return Effect.void;
					}
				}

				// Skip TSLiteralType (`as const` in some AST forms)
				if (tsAs.typeAnnotation.type === 'TSLiteralType') {
					return Effect.void;
				}

				// Skip `as any` and `as unknown` — handled by avoid-any
				if (
					tsAs.typeAnnotation.type === 'TSAnyKeyword' ||
					tsAs.typeAnnotation.type === 'TSUnknownKeyword'
				) {
					return Effect.void;
				}

				// Skip `as never` — standard exhaustive check pattern
				if (tsAs.typeAnnotation.type === 'TSNeverKeyword') {
					return Effect.void;
				}

				return ctx.report(
					Diagnostic.make({
						node,
						message:
							'Type assertion `as T` tells the compiler "trust me." Before casting, check: (1) is the cast redundant? (2) can generics or Schema.decode replace it? (3) does the upstream type need fixing? `as const` is always acceptable.'
					})
				);
			}
		};
	}
});
