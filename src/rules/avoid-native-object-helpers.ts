import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isMemberExpr } from '../utils.ts';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow native Object.keys/values/entries and new Map/Set — use Effect modules (EF-5)'
		}
	},
	create(context) {
		return {
			MemberExpression(node) {
				if (isMemberExpr(node, 'Object', 'keys')) {
					context.report({
						node,
						message:
							'Use `R.keys(obj)` from `effect/Record` instead of `Object.keys(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
					});
				}
				if (isMemberExpr(node, 'Object', 'values')) {
					context.report({
						node,
						message:
							'Use `R.values(obj)` from `effect/Record` instead of `Object.values(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
					});
				}
				if (isMemberExpr(node, 'Object', 'entries')) {
					context.report({
						node,
						message:
							'Use `R.toEntries(obj)` from `effect/Record` instead of `Object.entries(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
					});
				}
				if (isMemberExpr(node, 'Object', 'fromEntries')) {
					context.report({
						node,
						message:
							'Use `R.fromEntries(entries)` from `effect/Record` instead of `Object.fromEntries(...)`. Effect Record helpers are type-safe and composable. (EF-5)'
					});
				}
			},
			NewExpression(node) {
				if (node.callee.type !== 'Identifier') return;
				const name = node.callee.name;
				if (name === 'Map') {
					context.report({
						node,
						message:
							'Use `HashMap` from `effect/HashMap` instead of native `Map`. HashMap provides structural equality and immutability. (EF-5)'
					});
				}
				if (name === 'Set') {
					context.report({
						node,
						message:
							'Use `HashSet` from `effect/HashSet` instead of native `Set`. HashSet provides structural equality and immutability. (EF-5)'
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
