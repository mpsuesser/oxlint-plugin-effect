import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

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

const MSG =
	'Avoid blanket `Effect.catch` / `Effect.catchCause` with default values — this silently swallows all errors. Use `Effect.catchTag` or `Effect.catchTags` for precise, targeted recovery. (EF-30)';

export default Rule.define({
	name: 'effect-catchall-default',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow Effect.catch/catchCause with blanket default values — use catchTag for precise recovery (EF-30)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;

				// Match any of the catch methods
				let matched = false;
				for (const method of CATCH_METHODS) {
					if (AST.isCallOf(call, 'Effect', method)) {
						matched = true;
						break;
					}
				}
				if (!matched) return Effect.void;

				// The first argument should be a function
				const handler = call.arguments[0];
				if (!handler) return Effect.void;

				// Check if the handler body returns Effect.succeed or Effect.sync
				if (
					handler.type !== 'ArrowFunctionExpression' &&
					handler.type !== 'FunctionExpression'
				) {
					return Effect.void;
				}

				const body = handler.body;
				if (!body) return Effect.void;

				// Arrow with expression body: `() => Effect.succeed(default)`
				if (body.type === 'CallExpression') {
					if (
						AST.isCallOf(body, 'Effect', 'succeed') ||
						AST.isCallOf(body, 'Effect', 'sync')
					) {
						return ctx.report(
							Diagnostic.make({ node, message: MSG })
						);
					}
				}

				// Block body: check if single return statement returns Effect.succeed/sync
				if (body.type === 'BlockStatement' && body.body.length === 1) {
					const stmt = body.body[0];
					if (!stmt) return Effect.void;
					if (
						stmt.type === 'ReturnStatement' &&
						stmt.argument &&
						stmt.argument.type === 'CallExpression'
					) {
						if (
							AST.isCallOf(stmt.argument, 'Effect', 'succeed') ||
							AST.isCallOf(stmt.argument, 'Effect', 'sync')
						) {
							return ctx.report(
								Diagnostic.make({ node, message: MSG })
							);
						}
					}
				}

				return Effect.void;
			}
		};
	}
});
