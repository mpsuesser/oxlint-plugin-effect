import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const REQUIRED_KEYS = ['identifier', 'title', 'description'] as const;

function checkOptionsObject(
	fnName: string,
	node: ESTree.Node,
	optionsArg: ESTree.Argument
): ReadonlyArray<string> {
	if (optionsArg.type !== 'ObjectExpression') {
		// Options is not an object literal — cannot statically verify
		return [];
	}

	const presentKeys = new Set<string>();
	for (const propOrSpread of optionsArg.properties) {
		if (propOrSpread.type !== 'Property') continue;
		const keyName =
			propOrSpread.key.type === 'Identifier'
				? propOrSpread.key.name
				: propOrSpread.key.type === 'Literal'
					? String(propOrSpread.key.value)
					: undefined;
		if (keyName) presentKeys.add(keyName);
	}

	return REQUIRED_KEYS.filter((k) => !presentKeys.has(k));
}

export default Rule.define({
	name: 'require-filter-metadata',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Schema.makeFilter/makeFilterGroup must include identifier, title, and description (EF-12c)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;

				// Schema.makeFilter(predicate) — needs 2nd arg with metadata
				if (AST.isCallOf(call, 'Schema', 'makeFilter')) {
					const optionsArg = call.arguments[1];
					if (!optionsArg) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Schema.makeFilter` must include a metadata object with `identifier`, `title`, and `description` as the second argument. (EF-12c)'
							})
						);
					}
					const missing = checkOptionsObject(
						'Schema.makeFilter',
						node,
						optionsArg
					);
					if (missing.length > 0) {
						return ctx.report(
							Diagnostic.make({
								node,
								message: `\`Schema.makeFilter\` is missing required metadata: ${missing.map((k) => `\`${k}\``).join(', ')}. Reusable schema checks must include \`identifier\`, \`title\`, and \`description\`. (EF-12c)`
							})
						);
					}
				}

				// Schema.makeFilterGroup([filters]) — needs 2nd arg with metadata
				if (AST.isCallOf(call, 'Schema', 'makeFilterGroup')) {
					const optionsArg = call.arguments[1];
					if (!optionsArg) {
						return ctx.report(
							Diagnostic.make({
								node,
								message:
									'`Schema.makeFilterGroup` must include a metadata object with `identifier`, `title`, and `description` as the second argument. (EF-12c)'
							})
						);
					}
					const missing = checkOptionsObject(
						'Schema.makeFilterGroup',
						node,
						optionsArg
					);
					if (missing.length > 0) {
						return ctx.report(
							Diagnostic.make({
								node,
								message: `\`Schema.makeFilterGroup\` is missing required metadata: ${missing.map((k) => `\`${k}\``).join(', ')}. Reusable schema checks must include \`identifier\`, \`title\`, and \`description\`. (EF-12c)`
							})
						);
					}
				}

				return Effect.void;
			}
		};
	}
});
