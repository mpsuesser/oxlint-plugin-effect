import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const SYNC_FS_METHODS = new Set([
	'readFileSync',
	'writeFileSync',
	'mkdirSync',
	'readdirSync',
	'statSync',
	'existsSync',
	'copyFileSync',
	'unlinkSync',
	'rmdirSync',
	'renameSync',
	'appendFileSync'
]);

export default Rule.define({
	name: 'avoid-sync-fs',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow synchronous fs operations — use Effect FileSystem service for async I/O'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;

				// Match bare `readFileSync(...)` calls
				return Option.match(AST.calleeName(call), {
					onNone: () => {
						// Match `fs.readFileSync(...)` member calls
						if (
							call.callee.type === 'MemberExpression' &&
							call.callee.property.type === 'Identifier' &&
							SYNC_FS_METHODS.has(call.callee.property.name)
						) {
							return ctx.report(
								Diagnostic.make({
									node,
									message: `Avoid synchronous \`${call.callee.property.name}\` — it blocks the event loop. Use Effect's \`FileSystem\` service for async, composable file operations.`
								})
							);
						}
						return Effect.void;
					},
					onSome: (name) =>
						SYNC_FS_METHODS.has(name)
							? ctx.report(
									Diagnostic.make({
										node,
										message: `Avoid synchronous \`${name}\` — it blocks the event loop. Use Effect's \`FileSystem\` service for async, composable file operations.`
									})
								)
							: Effect.void
				});
			}
		};
	}
});
