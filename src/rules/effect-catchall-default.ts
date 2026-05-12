/**
 * Blanket `Effect.catch` / `catchCause` (and their v3 names) that return a
 * default value silently swallow every error variant — including ones that
 * should be fatal. Use `catchTag` / `catchTags` for targeted recovery, or
 * model expected absence as `Option`.
 *
 * The handler can express the default in either form:
 *   - `Effect.<succeed|sync>(default)` — fully qualified
 *   - `<succeed|sync>(default)` — bare callee, e.g. when `Effect` is
 *     destructured or namespaced via `import * as E from "effect/Effect"`.
 */

import type { ESTree } from 'effect-oxlint';

import { pipe } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

/**
 * All v3 + v4 names for blanket catch APIs.
 * v3: `catchAll`, `catchAllCause`
 * v4: `catch`, `catchCause`
 */
const CatchMethodName = Schema.Literals([
	'catchAll',
	'catch',
	'catchAllCause',
	'catchCause'
]).annotate({
	title: 'CatchMethodName',
	description:
		'Method names on `Effect` that perform blanket error recovery — covers both v3 (`catchAll(Cause)`) and v4 (`catch(Cause)`) spellings.'
});

const isCatchMethodName = Schema.is(CatchMethodName);

/**
 * Method names that produce a successful effect from a value — when one
 * of these appears as the body of a blanket catch handler, the recovery
 * is "return a default value" and the diagnostic applies.
 */
const DefaultProducerName = Schema.Literals(['succeed', 'sync']).annotate({
	title: 'DefaultProducerName',
	description:
		'`Effect.succeed` / `Effect.sync` (or their bare-callee forms) produce a constant default — using them inside a blanket catch silently swallows every error.'
});

const isDefaultProducerName = Schema.is(DefaultProducerName);

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/** A `CallExpression` whose callee is `Effect.<catch-method>(...)`. */
const isBlanketCatchCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Effect' && isCatchMethodName(prop)
		)
	);

/**
 * A `CallExpression` that produces a default value — matches both the
 * fully-qualified form `Effect.succeed(x)` / `Effect.sync(x)` and the
 * bare-callee form `succeed(x)` / `sync(x)`.
 */
const isDefaultProducerCall = (node: ESTree.CallExpression): boolean => {
	const bareName = pipe(
		AST.calleeName(node),
		Option.filter(isDefaultProducerName)
	);
	if (Option.isSome(bareName)) return true;
	return pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Effect' && isDefaultProducerName(prop)
		)
	);
};

/**
 * Extract the expression a function body evaluates to, when statically obvious.
 *
 * Handles:
 *   - Arrow concise body:  `() => expr`
 *   - Arrow block body with single return: `() => { return expr }`
 *   - Function expression block body with single return: `function() { return expr }`
 */
const handlerReturnExpression = (
	handler: ESTree.Expression | ESTree.SpreadElement
): Option.Option<ESTree.Expression> => {
	// Arrow body — either `FunctionBody` (block) or `Expression` (concise).
	const fromArrow = pipe(
		AST.narrow(handler, 'ArrowFunctionExpression'),
		Option.flatMap((node) =>
			node.body.type === 'BlockStatement'
				? singleReturnExpression(node.body)
				: Option.some(node.body)
		)
	);
	// FunctionExpression body — `FunctionBody | null`.
	const fromFunctionExpr = pipe(
		AST.narrow(handler, 'FunctionExpression'),
		Option.flatMap((node) => Option.fromNullishOr(node.body)),
		Option.flatMap(singleReturnExpression)
	);
	return pipe(
		fromArrow,
		Option.orElse(() => fromFunctionExpr)
	);
};

/** A block body containing exactly `return <expr>;` yields `Some(<expr>)`. */
const singleReturnExpression = (
	body: ESTree.FunctionBody
): Option.Option<ESTree.Expression> => {
	if (body.body.length !== 1) return Option.none();
	return pipe(
		Option.fromNullishOr(body.body[0]),
		Option.flatMap(AST.narrow('ReturnStatement')),
		Option.flatMap((ret) => Option.fromNullishOr(ret.argument))
	);
};

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const MESSAGE =
	'Avoid blanket `Effect.catch` / `Effect.catchCause` with default values — this silently swallows all errors. Use `Effect.catchTag` or `Effect.catchTags` for precise, targeted recovery. (EF-30)';

export default Rule.define({
	name: 'effect-catchall-default',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow `Effect.catch`/`catchCause`/`catchAll`/`catchAllCause` whose handler returns a constant default — use `catchTag` for precise recovery (EF-30)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) =>
				pipe(
					AST.narrow(node, 'CallExpression'),
					Option.filter(isBlanketCatchCall),
					Option.flatMap((call) =>
						Option.fromNullishOr(call.arguments[0])
					),
					Option.flatMap(handlerReturnExpression),
					Option.flatMap(AST.narrow('CallExpression')),
					Option.filter(isDefaultProducerCall),
					Option.match({
						onNone: () => Effect.void,
						onSome: () =>
							ctx.report(
								Diagnostic.make({ node, message: MESSAGE })
							)
					})
				)
		};
	}
});
