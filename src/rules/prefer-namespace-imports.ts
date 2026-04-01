import type { CreateRule, Visitor } from '@oxlint/plugins';

/**
 * Canonical alias map: Effect submodule → required namespace alias.
 * Only modules that have a non-obvious alias are listed here.
 */
const CANONICAL_ALIASES: Record<string, string> = {
	Array: 'Arr',
	Predicate: 'P',
	Record: 'R',
	String: 'Str',
	Equal: 'Eq',
	Boolean: 'Bool'
};

/**
 * Effect submodules that MUST use namespace imports (`import * as X from "effect/X"`).
 * This is a superset of the alias map — modules without an alias entry
 * simply require any namespace import (e.g. `import * as Option from "effect/Option"`).
 */
const NAMESPACE_MODULES = new Set([
	'Array',
	'Option',
	'Predicate',
	'Record',
	'Schema',
	'String',
	'Equal',
	'Boolean'
]);

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Enforce canonical namespace imports for Effect submodules (EF-4)'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const src = node.source.value;

				// ── Named imports from effect submodules ──
				// e.g. `import { map } from "effect/Array"` → should be `import * as Arr from "effect/Array"`
				if (
					src.startsWith('effect/') &&
					!src.startsWith('effect/unstable/')
				) {
					const submodule = src.slice('effect/'.length);
					if (!NAMESPACE_MODULES.has(submodule)) return;

					// Check if this is a named import (not a namespace import)
					const hasNamedImports = node.specifiers.some(
						(s) => s.type === 'ImportSpecifier'
					);
					if (hasNamedImports) {
						const alias = CANONICAL_ALIASES[submodule];
						const suggestion = alias
							? `import * as ${alias} from "${src}"`
							: `import * as ${submodule} from "${src}"`;
						context.report({
							node,
							message: `Use namespace imports for Effect submodules: \`${suggestion}\`. Named imports break tree-shaking and diverge from Effect conventions. (EF-4)`
						});
					}

					// Check if namespace alias is wrong
					const nsSpecifier = node.specifiers.find(
						(s) => s.type === 'ImportNamespaceSpecifier'
					);
					if (nsSpecifier && CANONICAL_ALIASES[submodule]) {
						const expected = CANONICAL_ALIASES[submodule];
						const local =
							nsSpecifier.type === 'ImportNamespaceSpecifier'
								? nsSpecifier.local.name
								: '';
						if (local !== expected) {
							context.report({
								node,
								message: `Use the canonical alias \`${expected}\` for \`${src}\` — got \`${local}\`. (EF-4)`
							});
						}
					}
				}

				// ── Named imports from the root "effect" barrel for modules that should be submodule imports ──
				// e.g. `import { Array } from "effect"` → should be `import * as Arr from "effect/Array"`
				if (src === 'effect') {
					for (const specifier of node.specifiers) {
						if (specifier.type !== 'ImportSpecifier') continue;
						const imported = specifier.imported;
						if (!imported || imported.type !== 'Identifier')
							continue;
						// Skip type-only imports
						if (specifier.importKind === 'type') continue;

						const name = imported.name;
						if (NAMESPACE_MODULES.has(name)) {
							const alias = CANONICAL_ALIASES[name] ?? name;
							context.report({
								node,
								message: `Import \`${name}\` from its submodule: \`import * as ${alias} from "effect/${name}"\`. Barrel imports from "effect" are slower and break Effect conventions. (EF-4)`
							});
						}
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
