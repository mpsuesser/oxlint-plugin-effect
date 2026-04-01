import type { CreateRule, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow Schema suffix on schema constant names — name after the domain type instead'
		}
	},
	create(context) {
		return {
			VariableDeclarator(node) {
				// Check `const fooSchema = Schema.*`
				if (
					node.id.type !== 'Identifier' ||
					!node.id.name.endsWith('Schema') ||
					node.id.name === 'Schema'
				)
					return;

				if (!node.init) return;

				// Check if the init references Schema in any form:
				// 1. CallExpression: `Schema.Class(...)`, `Schema.Struct(...)`, `pipe(Schema.String, ...)`
				// 2. MemberExpression: `Schema.String`, `Schema.Number`
				// 3. Chained calls: `Schema.String.pipe(...)`
				const isSchemaInit =
					// Schema.Foo(...)
					(node.init.type === 'CallExpression' &&
						node.init.callee.type === 'MemberExpression' &&
						node.init.callee.object.type === 'Identifier' &&
						node.init.callee.object.name === 'Schema') ||
					// Schema.String (bare member access)
					(node.init.type === 'MemberExpression' &&
						node.init.object.type === 'Identifier' &&
						node.init.object.name === 'Schema') ||
					// Schema.String.pipe(...) (chained call on Schema member)
					(node.init.type === 'CallExpression' &&
						node.init.callee.type === 'MemberExpression' &&
						node.init.callee.object.type === 'MemberExpression' &&
						node.init.callee.object.object.type === 'Identifier' &&
						node.init.callee.object.object.name === 'Schema');

				if (isSchemaInit) {
					context.report({
						node,
						message: `Avoid naming schema constants with a "Schema" suffix. Name \`${node.id.name}\` after the domain type it represents (e.g., \`${node.id.name.replace(/Schema$/, '')}\`). (EF-3, EF-8)`
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
