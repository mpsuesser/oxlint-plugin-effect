/**
 * Flag `let` declarations whose nearest enclosing factory is a
 * Layer.effect / Layer.scoped / Layer.succeed call, or the second-call of a
 * Context.Service<...>()(..., { make: ... }) definition.
 *
 * Outside those factories, `let` is fine — it's a common, unobjectionable
 * shape in pure helpers, tests, and narrow synchronous scopes. The pattern
 * is only suspicious inside service bodies, where it tends to hide
 * fiber-visible state that should live in `Ref`, `SynchronizedRef`, or
 * `Effect.cached`.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain: which factories own service-internal state
// ---------------------------------------------------------------------------

const LayerFactoryName = Schema.Literals([
	'effect',
	'scoped',
	'succeed'
]).annotate({
	title: 'LayerFactoryName',
	description:
		'Layer factories (`Layer.effect`, `Layer.scoped`, `Layer.succeed`) whose body owns service-internal state.'
});

const isLayerFactoryName = Schema.is(LayerFactoryName);

const MutableVariableKind = Schema.Literal('let').annotate({
	title: 'MutableVariableKind',
	description:
		'Variable declaration kinds flagged inside service-owning factories.'
});

const isMutableVariableKind = Schema.is(MutableVariableKind);

// ---------------------------------------------------------------------------
// CallExpression predicates: enter/exit tracking targets
// ---------------------------------------------------------------------------

/** `Layer.effect(...)`, `Layer.scoped(...)`, or `Layer.succeed(...)`. */
const isLayerFactoryCall = (node: ESTree.CallExpression): boolean =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.exists(
			([obj, prop]) => obj === 'Layer' && isLayerFactoryName(prop)
		)
	);

/**
 * `Context.Service<...>()(<key>, { make: ... })` — the canonical site of
 * in-service mutable state. We only flag the call when the second argument
 * carries a `make` property, so plain accessor-only services don't
 * unnecessarily trip the rule.
 */
const isContextServiceMakeCall = (node: ESTree.CallExpression): boolean => {
	const isContextServiceDoubleCall = pipe(
		AST.narrow(node.callee, 'CallExpression'),
		Option.flatMap((inner) => AST.narrow(inner.callee, 'MemberExpression')),
		Option.exists(AST.isMember('Context', 'Service'))
	);
	if (!isContextServiceDoubleCall) return false;
	return pipe(
		Option.fromNullishOr(node.arguments[1]),
		Option.flatMap(AST.narrow('ObjectExpression')),
		Option.exists(AST.objectHasKey('make'))
	);
};

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const MESSAGE =
	'Consider `Ref`, `SynchronizedRef`, or `Effect.cached` instead of `let` inside service-owning factories. Shared mutable bindings hide fiber-visible state and lifecycle behavior. `let` is fine in pure helpers and narrow scopes.';

export default Rule.define({
	name: 'avoid-mutable-state',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag `let` inside `Layer.effect` / `Layer.scoped` / `Layer.succeed` and `Context.Service` make blocks — service bodies where mutable state hides fiber-visible behavior.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const layerFactoryDepth = yield* Ref.make(0);
		const serviceMakeDepth = yield* Ref.make(0);

		const insideFactoryBody = Effect.gen(function* () {
			const layer = yield* Ref.get(layerFactoryDepth);
			const service = yield* Ref.get(serviceMakeDepth);
			return layer > 0 || service > 0;
		});

		return Visitor.merge(
			Visitor.tracked(
				'CallExpression',
				isLayerFactoryCall,
				layerFactoryDepth
			),
			Visitor.tracked(
				'CallExpression',
				isContextServiceMakeCall,
				serviceMakeDepth
			),
			Visitor.on('VariableDeclaration', (node) =>
				Effect.gen(function* () {
					if (!isMutableVariableKind(node.kind)) return;
					if (!(yield* insideFactoryBody)) return;
					yield* ctx.report(
						Diagnostic.make({ node, message: MESSAGE })
					);
				})
			)
		);
	}
});
