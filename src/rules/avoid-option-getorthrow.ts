/**
 * `getOrThrow` defeats the purpose of `Option` / `Result` / `Either` —
 * it converts a value that explicitly models absence or failure back
 * into an unchecked throw at the call site. Use the totally-defined
 * handlers instead: `match`, `getOrElse`, `map`, `flatMap`.
 *
 * Detection is intentionally broad: any `<receiver>.getOrThrow` member
 * access, regardless of receiver. That catches the common shapes —
 * `Option.getOrThrow(opt)`, namespace aliases like `O.getOrThrow(...)`,
 * other containers like `Either.getOrThrow` / `Result.getOrThrow`, and
 * method-form `result.getOrThrow()` — without needing to enumerate
 * every container module.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

const MESSAGE =
	'Do not use `.getOrThrow` — it defeats the purpose of `Option` / `Result` / `Either`. Use `match`, `getOrElse`, or `map` to handle both cases explicitly. (EF-2)';

/**
 * The property of a static `MemberExpression` is `getOrThrow`, regardless
 * of receiver. Computed accesses (`opt['getOrThrow']`) and private
 * identifiers (`#getOrThrow`) are excluded — `AST.memberNames` already
 * filters those out.
 */
const isGetOrThrowAccess = (node: ESTree.MemberExpression): boolean =>
	pipe(
		AST.memberNames(node),
		Option.exists(([, prop]) => prop === 'getOrThrow')
	);

export default Rule.define({
	name: 'avoid-option-getorthrow',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow any `<receiver>.getOrThrow` member access — `Option.getOrThrow`, namespace aliases, `Either.getOrThrow`, `Result.getOrThrow` are all flagged. (EF-2)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('MemberExpression', (node) =>
			isGetOrThrowAccess(node)
				? ctx.report(Diagnostic.make({ node, message: MESSAGE }))
				: Effect.void
		);
	}
});
