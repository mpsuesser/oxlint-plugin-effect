import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

const rule: CreateRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow instance members on Schema.Opaque classes — they should be pure opaque wrappers'
		}
	},
	create(context) {
		// Track local identifiers that refer to Schema or Opaque from effect
		const schemaIdentifiers = new Set<string>();
		const opaqueIdentifiers = new Set<string>();

		const report = (opts: { node: unknown; message: string }) =>
			context.report(opts as never);

		return {
			ImportDeclaration(node) {
				const src = node.source.value;
				if (src !== 'effect' && src !== 'effect/Schema') return;

				for (const specifier of node.specifiers) {
					if (specifier.type === 'ImportNamespaceSpecifier') {
						if (src === 'effect/Schema' || src === 'effect') {
							schemaIdentifiers.add(specifier.local.name);
						}
					}
					if (specifier.type === 'ImportSpecifier') {
						const imported = specifier.imported;
						if (imported.type === 'Identifier') {
							if (imported.name === 'Schema') {
								schemaIdentifiers.add(specifier.local.name);
							}
							if (imported.name === 'Opaque') {
								opaqueIdentifiers.add(specifier.local.name);
							}
						}
					}
				}
			},
			ClassDeclaration(node) {
				checkClass(node, report, schemaIdentifiers, opaqueIdentifiers);
			},
			ClassExpression(node) {
				checkClass(node, report, schemaIdentifiers, opaqueIdentifiers);
			}
		} satisfies Visitor;
	}
};

function checkClass(
	node: ESTree.Class,
	report: (opts: { node: unknown; message: string }) => void,
	schemaIdentifiers: Set<string>,
	opaqueIdentifiers: Set<string>
): void {
	if (!node.superClass) return;

	const superClass = node.superClass;
	if (superClass.type !== 'CallExpression') return;
	if (superClass.callee.type !== 'CallExpression') return;

	const innerCallee = superClass.callee.callee;

	const isOpaqueCall =
		// Schema.Opaque(...)
		(innerCallee.type === 'MemberExpression' &&
			isMemberExprForOpaque(innerCallee, schemaIdentifiers)) ||
		// bare Opaque(...)
		(innerCallee.type === 'Identifier' &&
			opaqueIdentifiers.has(innerCallee.name));

	if (!isOpaqueCall) return;

	// Check for non-static instance members
	for (const member of node.body.body) {
		if (
			member.type === 'MethodDefinition' ||
			member.type === 'PropertyDefinition'
		) {
			if (member.static) continue; // static members are fine
			const keyName =
				member.key.type === 'Identifier' ? member.key.name : undefined;
			report({
				node: member,
				message: `\`Schema.Opaque\` classes should be pure opaque wrappers — do not add instance ${member.type === 'MethodDefinition' ? 'methods' : 'properties'}${keyName ? ` (\`${keyName}\`)` : ''}. Use static methods or external functions instead.`
			});
		}
	}
}

function isMemberExprForOpaque(
	node: ESTree.MemberExpression,
	schemaIdentifiers: Set<string>
): boolean {
	return (
		node.object.type === 'Identifier' &&
		schemaIdentifiers.has(node.object.name) &&
		node.property.type === 'Identifier' &&
		node.property.name === 'Opaque'
	);
}

export default rule;
