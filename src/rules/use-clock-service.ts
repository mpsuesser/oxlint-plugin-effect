import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isMemberExpr } from '../utils.ts';

const MESSAGE =
	'Avoid direct `Date` usage in Effect code. Use `DateTime` from `effect` or the `Clock` service for testable, deterministic time operations. (EF-9)';

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow new Date() and Date.* — use Effect DateTime/Clock service instead'
		}
	},
	create(context) {
		return {
			NewExpression(node) {
				// Only flag `new Date()` (current time). `new Date(value)` is
				// a conversion/parse operation and is legitimate.
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'Date' &&
					node.arguments.length === 0
				) {
					context.report({ node, message: MESSAGE });
				}
			},
			MemberExpression(node) {
				if (
					isMemberExpr(node, 'Date', 'now') ||
					isMemberExpr(node, 'Date', 'parse') ||
					isMemberExpr(node, 'Date', 'UTC')
				) {
					context.report({ node, message: MESSAGE });
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
