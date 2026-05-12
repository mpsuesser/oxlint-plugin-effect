/**
 * `Effect.fn("Namespace.method")(function*() {...})` adds a named trace
 * span automatically. Plain `Effect.gen` inside a service body is the
 * tracer-free version and almost always wants to be `Effect.fn` instead.
 *
 * Scope — flag an `Effect.gen` call when it sits inside any of these
 * service-defining factories:
 *  - `Layer.effect(...)` / `Layer.scoped(...)` / `Layer.succeed(...)`
 *  - `Context.Service<...>()(<key>, { make: ... })`
 *
 * Exemptions:
 *  - An `Effect.gen` nested directly inside an `Effect.fn` /
 *    `Effect.fnUntraced` wrapper is already traced.
 *  - The "factory body" `Effect.gen` itself — i.e., the one passed as
 *    the direct argument of `Layer.*` or as the value of `make:` in a
 *    `Context.Service` definition. That gen IS the service constructor,
 *    not a method. The exemption is precise to the immediate position,
 *    so an `Effect.gen` nested anywhere deeper inside the factory still
 *    gets flagged.
 *
 * Outside services, top-level `const foo = Effect.gen(...)` (or
 * `export default Effect.gen(...)`) is also flagged because it's a
 * named, reused effect that would benefit from a named span.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const LayerFactoryName = Schema.Literals([
	'effect',
	'scoped',
	'succeed'
]).annotate({
	title: 'LayerFactoryName',
	description:
		'`Layer.effect` / `Layer.scoped` / `Layer.succeed` — the factories that build service bodies.'
});

const isLayerFactoryName = Schema.is(LayerFactoryName);

const EffectFnLikeName = Schema.Literals(['fn', 'fnUntraced']).annotate({
	title: 'EffectFnLikeName',
	description:
		'`Effect.fn` and `Effect.fnUntraced` — already-traced wrappers; `Effect.gen` inside them is exempt.'
});

const isEffectFnLikeName = Schema.is(EffectFnLikeName);

const FlaggedAssignmentParentType = Schema.Literals([
	'VariableDeclarator',
	'ExportDefaultDeclaration'
]).annotate({
	title: 'FlaggedAssignmentParentType',
	description:
		'Parent shapes of a top-level `Effect.gen(...)` worth flagging — the function effectively gets a name through the binding.'
});

const isFlaggedAssignmentParentType = Schema.is(FlaggedAssignmentParentType);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/** `Layer.effect(...)` / `Layer.scoped(...)` / `Layer.succeed(...)`. */
const isLayerFactoryCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Layer' && isLayerFactoryName(prop)
		)
	);

/**
 * `Context.Service<...>()(...)` — the second call of the canonical
 * double-call service definition pattern.
 */
const isContextServiceDoubleCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'CallExpression'),
		Option.flatMap((inner) => AST.narrow(inner.callee, 'MemberExpression')),
		Option.exists(AST.isMember('Context', 'Service'))
	);

/** `Effect.gen(...)`. */
const isEffectGenCall = (node: ESTree.CallExpression): boolean =>
	AST.isCallOf(node, 'Effect', 'gen');

/** `Effect.fn(...)` or `Effect.fnUntraced(...)`. */
const isEffectFnLikeCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Effect' && isEffectFnLikeName(prop)
		)
	);

/**
 * Oxlint's ESTree types carry `parent: Node | null` on every node, so a
 * direct lift via `Option.fromNullishOr` is all we need.
 */
const parentNode = (node: ESTree.Node): Option.Option<ESTree.Node> =>
	Option.fromNullishOr(node.parent);

const parentOfType = <T extends string>(
	node: ESTree.Node,
	type: T
): Option.Option<ESTree.Node & { readonly type: T }> =>
	pipe(parentNode(node), Option.flatMap(AST.narrow(type)));

/**
 * The `Effect.gen` IS the direct factory body of a `Layer.*` call —
 * i.e., its immediate parent is `Layer.effect|scoped|succeed`. The gen
 * at this position is the service constructor, not a method, and must
 * not be flagged.
 */
const isLayerFactoryBody = (node: ESTree.Node): boolean =>
	pipe(
		parentOfType(node, 'CallExpression'),
		Option.exists(isLayerFactoryCall)
	);

/**
 * The `Effect.gen` IS the value of `make:` inside a
 * `Context.Service<...>()(<key>, { make: ... })` definition. Path:
 * gen → Property(make) → ObjectExpression → Context.Service double-call.
 */
const isContextServiceMakeBody = (node: ESTree.Node): boolean =>
	pipe(
		parentOfType(node, 'Property'),
		Option.filter(
			(prop) => prop.key.type === 'Identifier' && prop.key.name === 'make'
		),
		Option.flatMap((prop) => parentOfType(prop, 'ObjectExpression')),
		Option.flatMap((obj) => parentOfType(obj, 'CallExpression')),
		Option.exists(isContextServiceDoubleCall)
	);

/** Either flavour of factory-body position — exempt from the rule. */
const isServiceFactoryBody = (node: ESTree.Node): boolean =>
	isLayerFactoryBody(node) || isContextServiceMakeBody(node);

/**
 * `const x = Effect.gen(...)` or `export default Effect.gen(...)` — a
 * named, reused effect whose call site deserves a span.
 */
const isFlaggedTopLevelAssignment = (node: ESTree.Node): boolean =>
	pipe(
		parentNode(node),
		Option.exists((p) => isFlaggedAssignmentParentType(p.type))
	);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const SERVICE_MESSAGE =
	'Use `Effect.fn("ServiceName.methodName")(function* (...) { ... })` instead of `Effect.gen` for service methods. `Effect.fn` provides automatic tracing with named spans. (EF-14)';

const TOP_LEVEL_MESSAGE =
	'Use `Effect.fn("functionName")(function* (...) { ... })` instead of assigning `Effect.gen(...)` to a variable. `Effect.fn` provides automatic tracing with named spans. (EF-14)';

export default Rule.define({
	name: 'prefer-effect-fn',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag `Effect.gen(...)` inside service-defining factories (`Layer.effect|scoped|succeed` or `Context.Service<...>()(..., { make })`), the factory-body `Effect.gen` itself exempted, and top-level named-binding assignments. `Effect.gen` inside `Effect.fn` / `Effect.fnUntraced` is exempt. (EF-14)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const layerFactoryDepth = yield* Ref.make(0);
		const serviceDefDepth = yield* Ref.make(0);
		const effectFnDepth = yield* Ref.make(0);

		return Visitor.merge(
			Visitor.tracked(
				'CallExpression',
				isLayerFactoryCall,
				layerFactoryDepth
			),
			Visitor.tracked(
				'CallExpression',
				isContextServiceDoubleCall,
				serviceDefDepth
			),
			Visitor.tracked(
				'CallExpression',
				isEffectFnLikeCall,
				effectFnDepth
			),
			Visitor.on('CallExpression', (node) =>
				Effect.gen(function* () {
					if (!isEffectGenCall(node)) return;

					// Already wrapped by Effect.fn / Effect.fnUntraced.
					if ((yield* Ref.get(effectFnDepth)) > 0) return;

					// THIS gen IS the factory body — its only job is to
					// build the service, not to be a method.
					if (isServiceFactoryBody(node)) return;

					const layer = yield* Ref.get(layerFactoryDepth);
					const svcDef = yield* Ref.get(serviceDefDepth);

					if (layer > 0 || svcDef > 0) {
						yield* ctx.report(
							Diagnostic.make({
								node,
								message: SERVICE_MESSAGE
							})
						);
						return;
					}

					if (isFlaggedTopLevelAssignment(node)) {
						yield* ctx.report(
							Diagnostic.make({
								node,
								message: TOP_LEVEL_MESSAGE
							})
						);
					}
				})
			)
		);
	}
});
