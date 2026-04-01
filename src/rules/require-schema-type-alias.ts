import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

/** Check if an expression references Schema.* (member access or call). */
const isSchemaReference = (init: ESTree.Expression): boolean => {
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
};

interface SchemaConst {
	readonly name: string;
	readonly node: ESTree.BindingIdentifier;
	readonly isTypeAlias: boolean;
}

export default Rule.define({
	name: 'require-schema-type-alias',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Exported non-class schemas should have a matching type alias export (EF-3)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return yield* Visitor.accumulate<SchemaConst>(
			'ExportNamedDeclaration',
			(node) => {
				const exportNode = node as ESTree.ExportNamedDeclaration;
				const decl = exportNode.declaration;
				if (!decl) return Option.none();

				// export type Foo = ...
				if (decl.type === 'TSTypeAliasDeclaration') {
					return Option.some({
						name: decl.id.name,
						node: decl.id as ESTree.BindingIdentifier,
						isTypeAlias: true
					});
				}

				// export const Foo = Schema.*
				if (decl.type !== 'VariableDeclaration') return Option.none();

				for (const declarator of decl.declarations) {
					if (declarator.id.type !== 'Identifier') continue;
					const name = declarator.id.name;
					const init = declarator.init;
					if (!init) continue;

					if (isSchemaReference(init)) {
						return Option.some({
							name,
							node: declarator.id as ESTree.BindingIdentifier,
							isTypeAlias: false
						});
					}
				}

				return Option.none();
			},
			(items) =>
				Effect.gen(function* () {
					const schemaConsts = new Map<
						string,
						ESTree.BindingIdentifier
					>();
					const typeAliases = new Set<string>();

					for (const item of items) {
						if (item.isTypeAlias) {
							typeAliases.add(item.name);
						} else {
							schemaConsts.set(item.name, item.node);
						}
					}

					for (const [name, constNode] of schemaConsts) {
						if (!typeAliases.has(name)) {
							yield* ctx.report(
								Diagnostic.make({
									node: constNode as unknown as ESTree.Node,
									message: `Exported schema constant \`${name}\` should have a matching \`export type ${name} = typeof ${name}.Type\`. Non-class schemas need explicit type alias exports. (EF-3)`
								})
							);
						}
					}
				})
		);
	}
});
