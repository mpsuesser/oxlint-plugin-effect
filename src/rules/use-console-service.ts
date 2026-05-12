/**
 * `console.*` in Effect code breaks the paradigm: the output is a raw
 * side effect, not a structured log event. Use `Effect.log*` (or the
 * `Console` service) so logs participate in spans, log levels, and the
 * test-time `TestConsole` capture.
 *
 * Detection covers every `console.<member>` access regardless of which
 * method is being read or called. The previous allowlist (just `log`,
 * `error`, `warn`, `info`, `debug`, `trace`) missed `console.table`,
 * `console.dir`, `console.group*`, `console.time*`, `console.assert`,
 * `console.count*`, `console.profile*`, `console.timeStamp`, etc.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

const MESSAGE =
	'Avoid `console.*` in Effect code. Use `Effect.logInfo`, `Effect.logError`, `Effect.logWarning`, `Effect.logDebug`, or the `Console` service for structured, testable logging. (EF-15)';

/**
 * A static `MemberExpression` of the form `console.<anything>`. Computed
 * accesses (`console['log']`) and private identifiers are excluded —
 * `AST.memberNames` already filters those out.
 */
const isConsoleAccess = (node: ESTree.MemberExpression): boolean =>
	pipe(
		AST.memberNames(node),
		Option.exists(([obj]) => obj === 'console')
	);

export default Rule.define({
	name: 'use-console-service',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow any `console.*` access in Effect code — including `log`, `error`, `warn`, `info`, `debug`, `trace`, `table`, `dir`, `group*`, `time*`, `assert`, `count*`, `profile*`, etc. (EF-15)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('MemberExpression', (node) =>
			isConsoleAccess(node)
				? ctx.report(Diagnostic.make({ node, message: MESSAGE }))
				: Effect.void
		);
	}
});
