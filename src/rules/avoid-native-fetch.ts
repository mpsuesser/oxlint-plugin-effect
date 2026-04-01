import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const MESSAGE =
	'Avoid native `fetch()` in Effect code. Use `HttpClientRequest`, `HttpClientResponse`, and `HttpClient` from Effect for typed errors, composable request building, and testability via layer substitution. (EF-9b)';

export default Rule.define({
	name: 'avoid-native-fetch',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow native fetch() — use Effect HttpClient modules instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;

				// Match bare `fetch(...)`
				return Option.match(AST.calleeName(call), {
					onNone: () => {
						// Match `window.fetch(...)` and `globalThis.fetch(...)`
						if (call.callee.type !== 'MemberExpression') {
							return Effect.void;
						}
						if (
							AST.isMember(call.callee, 'window', 'fetch') ||
							AST.isMember(call.callee, 'globalThis', 'fetch')
						) {
							return ctx.report(
								Diagnostic.make({
									node,
									message: MESSAGE
								})
							);
						}
						return Effect.void;
					},
					onSome: (name) =>
						name === 'fetch'
							? ctx.report(
									Diagnostic.make({
										node,
										message: MESSAGE
									})
								)
							: Effect.void
				});
			}
		};
	}
});
