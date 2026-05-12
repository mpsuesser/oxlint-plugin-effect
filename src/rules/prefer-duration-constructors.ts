/**
 * Numeric duration literals obscure units. Encourage `Duration.millis(...)`,
 * `Duration.seconds(...)`, etc. anywhere the Effect API treats a raw number
 * as a duration.
 *
 * Detection covers two argument shapes:
 *  - Positional duration argument: `Effect.sleep(1000)`, `Schedule.spaced(250)`.
 *  - `duration` key inside an options-object argument:
 *    `Effect.timeoutOrElse(effect, { duration: 5000, onTimeout })`.
 *
 * `Schedule.intersect` / `Schedule.union` are NOT listed: they combine
 * Schedules, not numbers. The previous inclusion was a bug that produced
 * nonsensical diagnostics.
 */

import type { ESTree } from 'effect-oxlint';

import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Schemas: enumerate the Duration-bearing APIs
// ---------------------------------------------------------------------------

const EffectDurationApi = Schema.Literals([
	'timeout',
	'timeoutOption',
	'timeoutOrElse',
	'timeoutFail',
	'timeoutFailCause',
	'sleep',
	'delay'
]).annotate({
	title: 'EffectDurationApi',
	description:
		'`Effect.*` helpers that accept a Duration or a numeric milliseconds value.'
});

const ScheduleDurationApi = Schema.Literals([
	'spaced',
	'fixed',
	'windowed',
	'duration'
]).annotate({
	title: 'ScheduleDurationApi',
	description:
		'`Schedule.*` constructors that accept a Duration or a numeric milliseconds value. (`Schedule.intersect`/`Schedule.union` combine Schedules and are intentionally excluded.)'
});

const isEffectDurationApi = Schema.is(EffectDurationApi);
const isScheduleDurationApi = Schema.is(ScheduleDurationApi);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/**
 * If the call's callee is a recognised duration API, return the qualified
 * name so it can appear in diagnostics.
 */
const matchDurationCall = (
	call: ESTree.CallExpression
): Option.Option<string> =>
	pipe(
		AST.narrow(call.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.flatMap(([obj, prop]) => {
			if (obj === 'Effect' && isEffectDurationApi(prop)) {
				return Option.some(`Effect.${prop}`);
			}
			if (obj === 'Schedule' && isScheduleDurationApi(prop)) {
				return Option.some(`Schedule.${prop}`);
			}
			return Option.none<string>();
		})
	);

/** Type predicate distinguishing `NumericLiteral` from the other Literal
 * subtypes (Boolean / Null / String / BigInt / RegExp), which all share
 * `type: 'Literal'` but carry different `.value` runtime types. */
const isNumericLiteral = (node: ESTree.Node): node is ESTree.NumericLiteral =>
	node.type === 'Literal' && P.isNumber(node.value);

/** A `Literal` whose `.value` is a number, lifted into `Option`. */
const asNumericLiteral = (
	node: ESTree.Node
): Option.Option<ESTree.NumericLiteral> =>
	isNumericLiteral(node) ? Option.some(node) : Option.none();

/**
 * An argument may contribute one flagged numeric literal:
 *  - direct positional number → the argument itself
 *  - options object with `duration: <number>` → the inner literal
 */
const flaggedLiteralIn = (
	arg: ESTree.Node
): Option.Option<ESTree.NumericLiteral> =>
	pipe(
		asNumericLiteral(arg),
		Option.orElse(() =>
			pipe(
				AST.narrow(arg, 'ObjectExpression'),
				Option.flatMap(AST.objectGetValue('duration')),
				Option.flatMap(asNumericLiteral)
			)
		)
	);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const messageFor = (apiName: string, value: number): string =>
	`Use \`Duration.millis(${value})\` or \`Duration.seconds(...)\` instead of a raw numeric literal in \`${apiName}\`. Duration constructors are self-documenting and prevent unit confusion. (EF-16)`;

export default Rule.define({
	name: 'prefer-duration-constructors',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Prefer Duration constructors over raw numeric literals for time values in Effect/Schedule APIs, including the `duration` key inside options-object arguments. (EF-16)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('CallExpression', (node) =>
			pipe(
				matchDurationCall(node),
				Option.match({
					onNone: () => Effect.void,
					onSome: (apiName) =>
						Effect.forEach(
							pipe(
								node.arguments,
								Arr.filterMap((arg) =>
									Result.fromOption(
										flaggedLiteralIn(arg),
										() => undefined
									)
								)
							),
							(lit) =>
								ctx.report(
									Diagnostic.make({
										node: lit,
										message: messageFor(apiName, lit.value)
									})
								),
							{ concurrency: 1, discard: true }
						)
				})
			)
		);
	}
});
