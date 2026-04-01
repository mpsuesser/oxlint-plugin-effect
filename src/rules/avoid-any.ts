import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow `as any` and `as unknown as T` type assertions'
		}
	},
	create(context) {
		return {
			TSAsExpression(node) {
				// Flag `as any`
				if (node.typeAnnotation.type === 'TSAnyKeyword') {
					context.report({
						node,
						message:
							'Avoid `as any` — it erases type safety. Use `Schema.decodeUnknown*` to validate unknown data, generics to preserve types, or fix the upstream type. (EF-3)'
					});
					return;
				}

				// Flag `expr as unknown as T` — the inner `as unknown` step
				// The parent of a double-cast `x as unknown as T` is another TSAsExpression.
				// We flag the inner `as unknown` when it's the expression of an outer `as T`.
				if (
					node.typeAnnotation.type === 'TSUnknownKeyword' &&
					node.parent.type === 'TSAsExpression'
				) {
					context.report({
						node,
						message:
							'Avoid `as unknown as T` — casting through unknown erases type information. Use `Schema.decodeUnknown*` to validate data, or fix the upstream type.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
