import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

/**
 * Canonical alias map: Effect submodule -> required namespace alias.
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
 * Effect submodules that MUST use namespace imports.
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

export default Rule.define({
	name: 'prefer-namespace-imports',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Enforce canonical namespace imports for Effect submodules (EF-4)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			ImportDeclaration: (node: ESTree.Node) => {
				const decl = node as ESTree.ImportDeclaration;
				const src = decl.source.value;

				// Named imports from effect submodules
				if (
					src.startsWith('effect/') &&
					!src.startsWith('effect/unstable/')
				) {
					const submodule = src.slice('effect/'.length);
					if (!NAMESPACE_MODULES.has(submodule)) return Effect.void;

					// Check if this is a named import (not a namespace import)
					const hasNamedImports = decl.specifiers.some(
						(s) => s.type === 'ImportSpecifier'
					);
					if (hasNamedImports) {
						const alias = CANONICAL_ALIASES[submodule];
						const suggestion = alias
							? `import * as ${alias} from "${src}"`
							: `import * as ${submodule} from "${src}"`;
						return ctx.report(
							Diagnostic.make({
								node,
								message: `Use namespace imports for Effect submodules: \`${suggestion}\`. Named imports break tree-shaking and diverge from Effect conventions. (EF-4)`
							})
						);
					}

					// Check if namespace alias is wrong
					const nsSpecifier = decl.specifiers.find(
						(s) => s.type === 'ImportNamespaceSpecifier'
					);
					if (nsSpecifier && CANONICAL_ALIASES[submodule]) {
						const expected = CANONICAL_ALIASES[submodule];
						const local =
							nsSpecifier.type === 'ImportNamespaceSpecifier'
								? nsSpecifier.local.name
								: '';
						if (local !== expected) {
							return ctx.report(
								Diagnostic.make({
									node,
									message: `Use the canonical alias \`${expected}\` for \`${src}\` — got \`${local}\`. (EF-4)`
								})
							);
						}
					}
				}

				// Named imports from the root "effect" barrel for modules that should be submodule imports
				if (src === 'effect') {
					for (const specifier of decl.specifiers) {
						if (specifier.type !== 'ImportSpecifier') continue;
						const imported = specifier.imported;
						if (!imported || imported.type !== 'Identifier')
							continue;
						// Skip type-only imports
						if (specifier.importKind === 'type') continue;

						const name = imported.name;
						if (NAMESPACE_MODULES.has(name)) {
							const alias = CANONICAL_ALIASES[name] ?? name;
							return ctx.report(
								Diagnostic.make({
									node,
									message: `Import \`${name}\` from its submodule: \`import * as ${alias} from "effect/${name}"\`. Barrel imports from "effect" are slower and break Effect conventions. (EF-4)`
								})
							);
						}
					}
				}

				return Effect.void;
			}
		};
	}
});
