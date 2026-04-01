import type { CreateRule, ESTree, Visitor } from '@oxlint/plugins';

/** Check whether a MemberExpression node is `obj.prop` (e.g. `Effect.gen`). */
export function isMemberExpr(
	node: ESTree.MemberExpression,
	obj: string,
	prop: string
): boolean {
	return (
		node.object.type === 'Identifier' &&
		node.object.name === obj &&
		node.property.type === 'Identifier' &&
		node.property.name === prop
	);
}

/** Check whether a CallExpression is `obj.prop(...)`. */
export function isCallOfMember(
	node: ESTree.CallExpression,
	obj: string,
	prop: string
): boolean {
	return (
		node.callee.type === 'MemberExpression' &&
		isMemberExpr(node.callee, obj, prop)
	);
}

/**
 * Build a simple MemberExpression rule that flags `obj.prop`.
 * Handles one or more (obj, prop) pairs with distinct messages.
 */
export function memberExprRule(
	description: string,
	checks: ReadonlyArray<{
		readonly obj: string;
		readonly prop: string | ReadonlyArray<string>;
		readonly message: string;
	}>
): CreateRule {
	return {
		meta: { type: 'suggestion', docs: { description } },
		create(context) {
			return {
				MemberExpression(node) {
					if (
						node.object.type !== 'Identifier' ||
						node.property.type !== 'Identifier'
					)
						return;
					const objName = node.object.name;
					const propName = node.property.name;
					for (const check of checks) {
						if (objName !== check.obj) continue;
						const props = Array.isArray(check.prop)
							? check.prop
							: [check.prop];
						if (props.includes(propName)) {
							context.report({ node, message: check.message });
						}
					}
				}
			} satisfies Visitor;
		}
	};
}

/**
 * Build a MemberExpression rule from a flat table of `[obj, prop, message]` entries.
 * More compact than `memberExprRule` when there are many entries for the same object.
 * Groups entries by object name internally for O(1) lookup.
 */
export function memberExprTable(
	description: string,
	meta: { readonly type: 'problem' | 'suggestion' },
	entries: ReadonlyArray<
		readonly [obj: string, prop: string, message: string]
	>
): CreateRule {
	// Pre-group by object name for fast lookup
	const table = new Map<string, Map<string, string>>();
	for (const [obj, prop, message] of entries) {
		let props = table.get(obj);
		if (!props) {
			props = new Map();
			table.set(obj, props);
		}
		props.set(prop, message);
	}
	return {
		meta: { type: meta.type, docs: { description } },
		create(context) {
			return {
				MemberExpression(node) {
					if (
						node.object.type !== 'Identifier' ||
						node.property.type !== 'Identifier'
					)
						return;
					const props = table.get(node.object.name);
					if (!props) return;
					const message = props.get(node.property.name);
					if (message) {
						context.report({ node, message });
					}
				}
			} satisfies Visitor;
		}
	};
}

/**
 * Build a simple ImportDeclaration rule that flags imports from specific sources.
 */
export function importRule(
	description: string,
	checks: ReadonlyArray<{
		readonly source: string | ((source: string) => boolean);
		readonly message: string;
	}>
): CreateRule {
	return {
		meta: { type: 'suggestion', docs: { description } },
		create(context) {
			return {
				ImportDeclaration(node) {
					const src = node.source.value;
					for (const check of checks) {
						const match =
							typeof check.source === 'string'
								? src === check.source
								: check.source(src);
						if (match) {
							context.report({ node, message: check.message });
						}
					}
				}
			} satisfies Visitor;
		}
	};
}
