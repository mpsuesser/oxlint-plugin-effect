import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Flag | null and | undefined in type unions — consider using Option<T> instead for explicit absence modeling (EF-2)'
		}
	},
	create(context) {
		return {
			TSUnionType(node) {
				const hasNull = node.types.some(
					(t) => t.type === 'TSNullKeyword'
				);
				const hasUndefined = node.types.some(
					(t) => t.type === 'TSUndefinedKeyword'
				);

				if (hasNull && hasUndefined) {
					context.report({
						node,
						message:
							'Consider using `Option<T>` instead of `T | null | undefined` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
					});
				} else if (hasNull) {
					context.report({
						node,
						message:
							'Consider using `Option<T>` instead of `T | null` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
					});
				} else if (hasUndefined) {
					context.report({
						node,
						message:
							'Consider using `Option<T>` instead of `T | undefined` for explicit absence modeling. `Option` provides composable helpers (`map`, `flatMap`, `match`, `getOrElse`) and eliminates null-check bugs. (EF-2)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
