import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

import { isCallOfMember } from '../utils.ts';

const REQUIRED_KEYS = ['identifier', 'title', 'description'] as const;

function checkOptionsObject(
	reportFn: (opts: { node: unknown; message: string }) => void,
	node: unknown,
	fnName: string,
	optionsArg: ESTree.Argument
): void {
	if (optionsArg.type !== 'ObjectExpression') {
		// Options is not an object literal — cannot statically verify
		return;
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

	const missing = REQUIRED_KEYS.filter((k) => !presentKeys.has(k));
	if (missing.length > 0) {
		reportFn({
			node,
			message: `\`${fnName}\` is missing required metadata: ${missing.map((k) => `\`${k}\``).join(', ')}. Reusable schema checks must include \`identifier\`, \`title\`, and \`description\`. (EF-12c)`
		});
	}
}

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Schema.makeFilter/makeFilterGroup must include identifier, title, and description (EF-12c)'
		}
	},
	create(context) {
		const report = (opts: { node: unknown; message: string }) =>
			context.report(opts as never);

		return {
			CallExpression(node) {
				// Schema.makeFilter(predicate) — needs 2nd arg with metadata
				if (isCallOfMember(node, 'Schema', 'makeFilter')) {
					const optionsArg = node.arguments[1];
					if (!optionsArg) {
						report({
							node,
							message:
								'`Schema.makeFilter` must include a metadata object with `identifier`, `title`, and `description` as the second argument. (EF-12c)'
						});
						return;
					}
					checkOptionsObject(
						report,
						node,
						'Schema.makeFilter',
						optionsArg
					);
				}

				// Schema.makeFilterGroup([filters]) — needs 2nd arg with metadata
				if (isCallOfMember(node, 'Schema', 'makeFilterGroup')) {
					const optionsArg = node.arguments[1];
					if (!optionsArg) {
						report({
							node,
							message:
								'`Schema.makeFilterGroup` must include a metadata object with `identifier`, `title`, and `description` as the second argument. (EF-12c)'
						});
						return;
					}
					checkOptionsObject(
						report,
						node,
						'Schema.makeFilterGroup',
						optionsArg
					);
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
