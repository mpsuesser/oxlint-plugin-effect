/**
 * Effect collection combinators (`Effect.forEach`, `Effect.all`, `Effect.validate`)
 * silently default to sequential execution when no `concurrency` option is
 * provided. That default is a real decision — but invisible at the call site,
 * which makes throughput intent unreviewable.
 *
 * The rule fires when the call's argument list does not contain an
 * ObjectExpression that statically carries a `concurrency` key:
 *
 *   Effect.forEach(items, fn)                          → flagged
 *   Effect.forEach(items, fn, { discard: true })       → flagged (no concurrency)
 *   Effect.forEach(items, fn, { concurrency: 4 })      → ok
 *   Effect.all(tasks)                                  → flagged
 *   Effect.all(tasks, { concurrency: 'unbounded' })    → ok
 *
 * We scan every argument so the rule survives small signature differences
 * across the three APIs without having to encode positional shapes.
 */

import type { ESTree } from 'effect-oxlint';

import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain: which Effect collection combinators care about concurrency
// ---------------------------------------------------------------------------

const ConcurrencyApi = Schema.Literals(['forEach', 'all', 'validate']).annotate(
	{
		title: 'ConcurrencyApi',
		description:
			'`Effect.*` collection combinators where throughput/ordering intent should be visible at the call site via an explicit `concurrency` option.'
	}
);

const isConcurrencyApi = Schema.is(ConcurrencyApi);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/** If the call's callee is `Effect.<concurrency-api>`, return the api name. */
const matchConcurrencyCall = (
	call: ESTree.CallExpression
): Option.Option<string> =>
	pipe(
		AST.narrow(call.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.flatMap(([obj, prop]) =>
			obj === 'Effect' && isConcurrencyApi(prop)
				? Option.some(`Effect.${prop}`)
				: Option.none<string>()
		)
	);

/** Is this argument an options object that statically declares concurrency? */
const carriesConcurrency = (arg: ESTree.Node): boolean =>
	pipe(
		AST.narrow(arg, 'ObjectExpression'),
		Option.exists(AST.objectHasKey('concurrency'))
	);

const anyArgCarriesConcurrency = (call: ESTree.CallExpression): boolean =>
	Arr.some(call.arguments, carriesConcurrency);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const messageFor = (apiName: string): string =>
	`Specify \`concurrency\` explicitly on \`${apiName}\`. Even sequential execution is a concurrency decision — make throughput and ordering intent reviewable at the call site (e.g. \`{ concurrency: 1 }\`, \`{ concurrency: 'unbounded' }\`, or a numeric limit). (EF-27)`;

export default Rule.define({
	name: 'require-effect-concurrency',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Require an explicit `concurrency` option on `Effect.forEach`, `Effect.all`, and `Effect.validate` so throughput intent is visible at the call site.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('CallExpression', (node) =>
			pipe(
				matchConcurrencyCall(node),
				Option.filter(() => !anyArgCarriesConcurrency(node)),
				Option.match({
					onNone: () => Effect.void,
					onSome: (apiName) =>
						ctx.report(
							Diagnostic.make({
								node,
								message: messageFor(apiName)
							})
						)
				})
			)
		);
	}
});
