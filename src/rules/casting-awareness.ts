import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Flag type assertions (as T) — verify the cast is necessary or improve upstream types'
		}
	},
	create(context) {
		return {
			TSAsExpression(node) {
				// Skip `as const` — it's always acceptable (narrows to literal types)
				if (node.typeAnnotation.type === 'TSTypeReference') {
					const name = node.typeAnnotation.typeName;
					if (name.type === 'Identifier' && name.name === 'const') {
						return;
					}
				}
				// Skip TSLiteralType which covers `as const` in some AST representations
				if (node.typeAnnotation.type === 'TSLiteralType') {
					return;
				}

				// Skip `as any` and `as unknown as T` — handled by avoid-any rule
				if (
					node.typeAnnotation.type === 'TSAnyKeyword' ||
					node.typeAnnotation.type === 'TSUnknownKeyword'
				) {
					return;
				}

				// Skip `as never` — standard pattern for exhaustive checks
				if (node.typeAnnotation.type === 'TSNeverKeyword') {
					return;
				}

				context.report({
					node,
					message:
						'Type assertion `as T` tells the compiler "trust me." Before casting, check: (1) is the cast redundant? (2) can generics or Schema.decode replace it? (3) does the upstream type need fixing? `as const` is always acceptable.'
				});
			}
		} satisfies Visitor;
	}
};

export default rule;
