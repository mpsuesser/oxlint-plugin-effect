import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow Object and {} as types — use Record, Schema, or specific interfaces'
		}
	},
	create(context) {
		return {
			TSTypeReference(node) {
				// Flag `: Object` type references
				if (
					node.typeName.type === 'Identifier' &&
					node.typeName.name === 'Object'
				) {
					context.report({
						node,
						message:
							'Avoid using `Object` as a type — it provides no type safety. Use a specific interface, `Record<string, unknown>`, or a `Schema.Class`.'
					});
				}
			},
			TSTypeLiteral(node) {
				// Flag `: {}` empty object type literals
				if (node.members.length === 0) {
					context.report({
						node,
						message:
							'Avoid using `{}` as a type — it matches any non-nullish value. Use `Record<string, never>` for an empty object, or a specific interface.'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
