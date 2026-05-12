/**
 * Direct `Date` usage is non-deterministic and untestable. The Effect
 * `Clock` service and the `DateTime` module surface time as effects, which
 * lets tests pin time via `TestClock` and lets production code thread the
 * dependency explicitly.
 *
 * Pattern EF-9 flags every `new Date(...)` — including the parse form
 * `new Date(value)` — and every `Date.<static>` access. The few legitimate
 * parse-shaped uses can suppress with `oxlint-disable-next-line`.
 */

import { pipe } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const DateGlobal = Schema.Literal('Date').annotate({
	title: 'DateGlobal',
	description:
		'The global `Date` constructor — both `new Date(...)` and `Date.*` static helpers should yield to `Clock`/`DateTime`.'
});

const isDateGlobal = Schema.is(DateGlobal);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const MESSAGE =
	'Avoid direct `Date` usage in Effect code. Use `DateTime` from `effect` or the `Clock` service for testable, deterministic time. Suppress with `oxlint-disable-next-line` for legitimate parse cases. (EF-9)';

export default Rule.define({
	name: 'use-clock-service',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow `new Date(...)` and `Date.*` — use Effect `DateTime` / `Clock` instead (EF-9)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.merge(
			// `new Date(...)` in any arity — including the parse form
			// `new Date(value)`. Production code threads time through Clock.
			Visitor.on('NewExpression', (node) =>
				pipe(
					AST.narrow(node.callee, 'Identifier'),
					Option.map((id) => id.name),
					Option.filter(isDateGlobal),
					Option.match({
						onNone: () => Effect.void,
						onSome: () =>
							ctx.report(
								Diagnostic.make({ node, message: MESSAGE })
							)
					})
				)
			),
			// `Date.<anything>` — `now`, `parse`, `UTC`, and any future static.
			Visitor.on('MemberExpression', (node) =>
				pipe(
					AST.memberNames(node),
					Option.filter(([obj]) => isDateGlobal(obj)),
					Option.match({
						onNone: () => Effect.void,
						onSome: () =>
							ctx.report(
								Diagnostic.make({ node, message: MESSAGE })
							)
					})
				)
			)
		);
	}
});
