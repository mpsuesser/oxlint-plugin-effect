import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';

import { Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

/** Check if a MemberExpression is `Schema.Opaque` (or similar namespace.Opaque). */
const isMemberExprForOpaque = (
	node: ESTree.MemberExpression,
	schemaIdentifiers: ReadonlySet<string>
): boolean =>
	node.object.type === 'Identifier' &&
	schemaIdentifiers.has(node.object.name) &&
	node.property.type === 'Identifier' &&
	node.property.name === 'Opaque';

/** Check a class node for opaque violations. */
const checkClass = (
	node: ESTree.Class,
	schemaIdentifiers: ReadonlySet<string>,
	opaqueIdentifiers: ReadonlySet<string>,
	ctx: {
		readonly report: (
			d: ReturnType<typeof Diagnostic.make>
		) => Effect.Effect<void>;
	}
): Effect.Effect<void> => {
	if (!node.superClass) return Effect.void;

	const superClass = node.superClass;
	if (superClass.type !== 'CallExpression') return Effect.void;
	if (superClass.callee.type !== 'CallExpression') return Effect.void;

	const innerCallee = superClass.callee.callee;

	const isOpaqueCall =
		(innerCallee.type === 'MemberExpression' &&
			isMemberExprForOpaque(innerCallee, schemaIdentifiers)) ||
		(innerCallee.type === 'Identifier' &&
			opaqueIdentifiers.has(innerCallee.name));

	if (!isOpaqueCall) return Effect.void;

	const reports: Array<Effect.Effect<void>> = [];
	for (const member of node.body.body) {
		if (
			member.type === 'MethodDefinition' ||
			member.type === 'PropertyDefinition'
		) {
			if (member.static) continue;
			const keyName =
				member.key.type === 'Identifier' ? member.key.name : undefined;
			reports.push(
				ctx.report(
					Diagnostic.make({
						node: member as unknown as ESTree.Node,
						message: `\`Schema.Opaque\` classes should be pure opaque wrappers — do not add instance ${member.type === 'MethodDefinition' ? 'methods' : 'properties'}${keyName ? ` (\`${keyName}\`)` : ''}. Use static methods or external functions instead.`
					})
				)
			);
		}
	}

	if (reports.length === 0) return Effect.void;
	return Effect.all(reports, { discard: true });
};

export default Rule.define({
	name: 'no-opaque-instance-fields',
	meta: Rule.meta({
		type: 'problem',
		description:
			'Disallow instance members on Schema.Opaque classes — they should be pure opaque wrappers'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const schemaIdsRef = yield* Ref.make<ReadonlySet<string>>(new Set());
		const opaqueIdsRef = yield* Ref.make<ReadonlySet<string>>(new Set());

		return Visitor.merge(
			Visitor.on('ImportDeclaration', (node) =>
				Effect.gen(function* () {
					const importNode = node as ESTree.ImportDeclaration;
					const src = importNode.source.value;
					if (src !== 'effect' && src !== 'effect/Schema') return;

					for (const specifier of importNode.specifiers) {
						if (specifier.type === 'ImportNamespaceSpecifier') {
							if (src === 'effect/Schema' || src === 'effect') {
								yield* Ref.update(
									schemaIdsRef,
									(s) => new Set([...s, specifier.local.name])
								);
							}
						}
						if (specifier.type === 'ImportSpecifier') {
							const imported = specifier.imported;
							if (imported.type === 'Identifier') {
								if (imported.name === 'Schema') {
									yield* Ref.update(
										schemaIdsRef,
										(s) =>
											new Set([
												...s,
												specifier.local.name
											])
									);
								}
								if (imported.name === 'Opaque') {
									yield* Ref.update(
										opaqueIdsRef,
										(s) =>
											new Set([
												...s,
												specifier.local.name
											])
									);
								}
							}
						}
					}
				})
			),
			Visitor.on('ClassDeclaration', (node) =>
				Effect.gen(function* () {
					const schemaIds = yield* Ref.get(schemaIdsRef);
					const opaqueIds = yield* Ref.get(opaqueIdsRef);
					yield* checkClass(
						node as unknown as ESTree.Class,
						schemaIds,
						opaqueIds,
						ctx
					);
				})
			),
			Visitor.on('ClassExpression', (node) =>
				Effect.gen(function* () {
					const schemaIds = yield* Ref.get(schemaIdsRef);
					const opaqueIds = yield* Ref.get(opaqueIdsRef);
					yield* checkClass(
						node as unknown as ESTree.Class,
						schemaIds,
						opaqueIds,
						ctx
					);
				})
			)
		);
	}
});
