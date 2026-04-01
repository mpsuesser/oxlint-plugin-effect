import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Exported non-class schemas should have a matching type alias export (EF-3)'
		}
	},
	create(context) {
		// Track exported schema const names and exported type alias names
		const exportedSchemaConsts = new Map<string, ESTree.BindingIdentifier>();
		const exportedTypeAliases = new Set<string>();

		return {
			// Detect: export const Foo = Schema.*
			ExportNamedDeclaration(node) {
				const decl = node.declaration;
				if (!decl) return;

				// export type Foo = ...
				if (decl.type === 'TSTypeAliasDeclaration') {
					exportedTypeAliases.add(decl.id.name);
					return;
				}

				// export const Foo = Schema.*
				if (decl.type !== 'VariableDeclaration') return;

				for (const declarator of decl.declarations) {
					if (declarator.id.type !== 'Identifier') continue;
					const name = declarator.id.name;
					const init = declarator.init;
					if (!init) continue;

					// Check if init references Schema.* (but not Schema.Class which creates its own type)
					const isSchemaRef = isSchemaReference(init);

					if (isSchemaRef) {
						exportedSchemaConsts.set(name, declarator.id as ESTree.BindingIdentifier);
					}
				}
			},
			'Program:exit'() {
				for (const [name, node] of exportedSchemaConsts) {
					if (!exportedTypeAliases.has(name)) {
						context.report({
							node,
							message: `Exported schema constant \`${name}\` should have a matching \`export type ${name} = typeof ${name}.Type\`. Non-class schemas need explicit type alias exports. (EF-3)`
						});
					}
				}
			}
		} satisfies Visitor;
	}
};

/** Check if an expression references Schema.* (member access or call). */
function isSchemaReference(init: ESTree.Expression): boolean {
	// Schema.String, Schema.Number, etc.
	if (
		init.type === 'MemberExpression' &&
		init.object.type === 'Identifier' &&
		init.object.name === 'Schema'
	) {
		return true;
	}

	if (
		init.type === 'CallExpression' &&
		init.callee.type === 'MemberExpression'
	) {
		// Schema.brand("X"), Schema.Literal("X"), etc.
		if (
			init.callee.object.type === 'Identifier' &&
			init.callee.object.name === 'Schema'
		) {
			return true;
		}
		// Schema.String.pipe(...), Schema.Struct({}).annotations(...)
		return isSchemaReference(init.callee.object);
	}

	return false;
}

export default rule;
