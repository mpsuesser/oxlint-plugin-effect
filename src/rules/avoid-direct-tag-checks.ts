/**
 * Discriminating a tagged union by reading `._tag` directly is fragile
 * and skips type narrowing. Prefer:
 *  - `Schema.is(MyClass)` / `MyEnum.$is("Tag")` for guards
 *  - `Match.value(...).pipe(Match.tag(...))` / `MyEnum.$match` for branching
 *
 * Detected shapes (any one fires):
 *  - `x._tag === "Foo"`, `x._tag !== "Foo"`
 *  - `"Foo" === x._tag`, `"Foo" !== x._tag`
 *  - `switch (x._tag) { ... }`
 *
 * The literal on the RHS may be a string `Literal` or a `TemplateLiteral`;
 * any other shape (variable, computed expression) is left alone — those
 * almost never read like tag discrimination at the call site.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const TagEqualityOperator = Schema.Literals(['===', '!==']).annotate({
	title: 'TagEqualityOperator',
	description:
		'Strict-equality operators that participate in `._tag` discrimination checks.'
});

const isTagEqualityOperator = Schema.is(TagEqualityOperator);

const TagLiteralNodeType = Schema.Literals([
	'Literal',
	'TemplateLiteral'
]).annotate({
	title: 'TagLiteralNodeType',
	description:
		'AST node types that count as a "literal" tag value when comparing against `._tag`.'
});

const isTagLiteralNodeType = Schema.is(TagLiteralNodeType);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/** A `MemberExpression` whose property is the identifier `_tag`. */
const isTagAccess = (node: ESTree.Node): boolean =>
	pipe(
		AST.narrow(node, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(([, prop]) => prop === '_tag')
	);

/** Plain or template literal — a constant tag value at the call site. */
const isLiteralLikeNode = (node: ESTree.Node): boolean =>
	isTagLiteralNodeType(node.type);

/**
 * One side of `===`/`!==` is `._tag` and the other side is a literal.
 * Order doesn't matter — `x._tag === "Foo"` and `"Foo" === x._tag` both
 * count.
 */
const isTagComparisonPair = (left: ESTree.Node, right: ESTree.Node): boolean =>
	(isTagAccess(left) && isLiteralLikeNode(right)) ||
	(isTagAccess(right) && isLiteralLikeNode(left));

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const MESSAGE =
	'Avoid direct `._tag === "..."` checks. Use `$is("Tag")` for type guards, `$match` for exhaustive pattern matching, or `Match.value(...).pipe(Match.when(...))` for composable branching. (EF-7)';

export default Rule.define({
	name: 'avoid-direct-tag-checks',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			"Disallow direct `._tag === '...'` / `!== '...'` checks and `switch(_._tag)` discrimination — use `$is`, `$match`, or `Match` instead."
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return Visitor.merge(
			Visitor.on('BinaryExpression', (node) => {
				if (!isTagEqualityOperator(node.operator)) return Effect.void;
				if (!isTagComparisonPair(node.left, node.right))
					return Effect.void;
				return ctx.report(Diagnostic.make({ node, message: MESSAGE }));
			}),
			Visitor.on('SwitchStatement', (node) =>
				isTagAccess(node.discriminant)
					? ctx.report(Diagnostic.make({ node, message: MESSAGE }))
					: Effect.void
			)
		);
	}
});
