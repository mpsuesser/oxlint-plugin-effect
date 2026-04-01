import type { CreateRule, Visitor } from '@oxlint/plugins';

/**
 * Packages where barrel imports (named imports from package root) should
 * be namespace imports from submodules instead.
 */
const BARREL_PACKAGES = new Set(['effect']);

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow named imports from barrel packages — use submodule namespace imports instead'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const src = node.source.value;
				if (!BARREL_PACKAGES.has(src)) return;

				// Skip type-only import declarations
				if (node.importKind === 'type') return;

				// Flag named imports (ImportSpecifier), not namespace (ImportNamespaceSpecifier)
				// or default (ImportDefaultSpecifier)
				for (const specifier of node.specifiers) {
					if (specifier.type !== 'ImportSpecifier') continue;

					// Skip type-only specifiers within a value import
					if (specifier.importKind === 'type') continue;

					const imported = specifier.imported;
					if (!imported || imported.type !== 'Identifier') continue;

					const name = imported.name;
					context.report({
						node,
						message: `Prefer \`import * as ${name} from "${src}/${name}"\` over named import from barrel package "${src}". Barrel imports are slower and bypass tree-shaking.`
					});
					// Report once per declaration to avoid noise
					return;
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
