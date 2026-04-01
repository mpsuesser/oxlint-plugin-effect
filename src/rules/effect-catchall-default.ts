import type { CreateRule, Visitor } from '@oxlint/plugins';

import { isCallOfMember } from '../utils.ts';

/**
 * All v3 + v4 names for blanket catch APIs.
 * v3: catchAll, catchAllCause
 * v4: catch, catchCause
 */
const CATCH_METHODS = [
	'catchAll',
	'catch',
	'catchAllCause',
	'catchCause'
] as const;

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow Effect.catch/catchCause with blanket default values — use catchTag for precise recovery (EF-30)'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				// Match any of the catch methods
				let matched = false;
				for (const method of CATCH_METHODS) {
					if (isCallOfMember(node, 'Effect', method)) {
						matched = true;
						break;
					}
				}
				if (!matched) return;

				// The first argument should be a function
				const handler = node.arguments[0];
				if (!handler) return;

				// Check if the handler body returns Effect.succeed or Effect.sync
				if (
					handler.type !== 'ArrowFunctionExpression' &&
					handler.type !== 'FunctionExpression'
				)
					return;

				const body = handler.body;
				if (!body) return;

				const MSG =
					'Avoid blanket `Effect.catch` / `Effect.catchCause` with default values — this silently swallows all errors. Use `Effect.catchTag` or `Effect.catchTags` for precise, targeted recovery. (EF-30)';

				// Arrow with expression body: `() => Effect.succeed(default)`
				if (body.type === 'CallExpression') {
					if (
						isCallOfMember(body, 'Effect', 'succeed') ||
						isCallOfMember(body, 'Effect', 'sync')
					) {
						context.report({ node, message: MSG });
					}
				}

				// Block body: check if single return statement returns Effect.succeed/sync
				if (body.type === 'BlockStatement' && body.body.length === 1) {
					const stmt = body.body[0];
					if (!stmt) return;
					if (
						stmt.type === 'ReturnStatement' &&
						stmt.argument &&
						stmt.argument.type === 'CallExpression'
					) {
						if (
							isCallOfMember(
								stmt.argument,
								'Effect',
								'succeed'
							) ||
							isCallOfMember(stmt.argument, 'Effect', 'sync')
						) {
							context.report({ node, message: MSG });
						}
					}
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
