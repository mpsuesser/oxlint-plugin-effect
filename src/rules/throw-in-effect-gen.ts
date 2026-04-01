import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow throw statements inside Effect.gen — use yield* Effect.fail() instead'
		}
	},
	create(context) {
		let effectGenDepth = 0;
		let tryPropertyDepth = 0;

		/** Check if a CallExpression is `Effect.gen(...)` */
		function isEffectGenCall(node: ESTree.CallExpression): boolean {
			return (
				node.callee.type === 'MemberExpression' &&
				node.callee.object.type === 'Identifier' &&
				node.callee.object.name === 'Effect' &&
				node.callee.property.type === 'Identifier' &&
				node.callee.property.name === 'gen'
			);
		}

		/** Check if a CallExpression is `Effect.tryPromise(...)` or `Effect.try(...)` */
		function isEffectTryCall(node: ESTree.CallExpression): boolean {
			return (
				node.callee.type === 'MemberExpression' &&
				node.callee.object.type === 'Identifier' &&
				node.callee.object.name === 'Effect' &&
				node.callee.property.type === 'Identifier' &&
				(node.callee.property.name === 'tryPromise' ||
					node.callee.property.name === 'try')
			);
		}

		/**
		 * Check if an ObjectProperty is the `try` key inside an Effect.tryPromise
		 * or Effect.try call. Structure: Effect.tryPromise({ try: ..., catch: ... })
		 */
		function isTryPropertyOfEffectTry(
			node: ESTree.ObjectProperty
		): boolean {
			if (node.key.type !== 'Identifier' || node.key.name !== 'try')
				return false;

			// Walk up: ObjectProperty -> ObjectExpression -> CallExpression
			const { parent } = node;
			if (parent?.type !== 'ObjectExpression') return false;

			const grandparent = parent.parent;
			if (grandparent?.type !== 'CallExpression') return false;

			return isEffectTryCall(grandparent);
		}

		return {
			CallExpression(node) {
				if (isEffectGenCall(node)) {
					effectGenDepth++;
				}
			},
			'CallExpression:exit'(node: ESTree.CallExpression) {
				if (isEffectGenCall(node)) {
					effectGenDepth--;
				}
			},

			Property(node: ESTree.ObjectProperty) {
				if (isTryPropertyOfEffectTry(node)) {
					tryPropertyDepth++;
				}
			},
			'Property:exit'(node: ESTree.ObjectProperty) {
				if (isTryPropertyOfEffectTry(node)) {
					tryPropertyDepth--;
				}
			},

			ThrowStatement(node) {
				if (effectGenDepth > 0 && tryPropertyDepth === 0) {
					context.report({
						node,
						message:
							'Do not throw inside `Effect.gen`. Use `yield* Effect.fail(new MyError(...))` to keep errors in the typed channel. (EF-1)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
