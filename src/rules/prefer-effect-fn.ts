import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

/** Check if a CallExpression is the ServiceMap.Service(...)(...) double-call pattern. */
const isServiceDefCall = (node: ESTree.CallExpression): boolean =>
	node.callee.type === 'CallExpression' &&
	node.callee.callee.type === 'MemberExpression' &&
	AST.isMember(node.callee.callee, 'ServiceMap', 'Service');

/**
 * Check if the second argument of a ServiceMap.Service(...)(key, { make: Effect.gen(...) })
 * call has a `make` property whose value is Effect.gen(...).
 */
const hasMakeEffectGen = (node: ESTree.CallExpression): boolean => {
	const secondArg = node.arguments[1];
	if (!secondArg || secondArg.type !== 'ObjectExpression') return false;
	for (const propOrSpread of secondArg.properties) {
		if (propOrSpread.type !== 'Property') continue;
		if (
			propOrSpread.key.type === 'Identifier' &&
			propOrSpread.key.name === 'make' &&
			propOrSpread.value.type === 'CallExpression' &&
			AST.isCallOf(
				propOrSpread.value as ESTree.CallExpression,
				'Effect',
				'gen'
			)
		) {
			return true;
		}
	}
	return false;
};

export default Rule.define({
	name: 'prefer-effect-fn',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Effect-returning functions should use Effect.fn for automatic tracing instead of plain Effect.gen (EF-14)'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const serviceDefDepth = yield* Ref.make(0);
		const effectFnDepth = yield* Ref.make(0);
		const serviceMakeDepth = yield* Ref.make(0);

		return Visitor.merge(
			// Track Effect.fn / Effect.fnUntraced depth
			Visitor.tracked(
				'CallExpression',
				(node) => {
					const call = node as ESTree.CallExpression;
					return (
						AST.isCallOf(call, 'Effect', 'fn') ||
						AST.isCallOf(call, 'Effect', 'fnUntraced')
					);
				},
				effectFnDepth
			),
			{
				CallExpression: (node: ESTree.Node) =>
					Effect.gen(function* () {
						const call = node as ESTree.CallExpression;

						// Detect ServiceMap.Service<T>()("key", { make: ... })
						if (isServiceDefCall(call)) {
							yield* Ref.update(serviceDefDepth, (n) => n + 1);
							if (hasMakeEffectGen(call)) {
								yield* Ref.update(
									serviceMakeDepth,
									(n) => n + 1
								);
							}
						}

						// Flag Effect.gen(...) that should use Effect.fn
						if (AST.isCallOf(call, 'Effect', 'gen')) {
							const fnDepth = yield* Ref.get(effectFnDepth);
							if (fnDepth > 0) return;

							const svcDepth = yield* Ref.get(serviceDefDepth);
							const makeDepth = yield* Ref.get(serviceMakeDepth);

							// Inside a service definition — flag methods but not the make factory
							if (svcDepth > 0 && makeDepth === 0) {
								yield* ctx.report(
									Diagnostic.make({
										node,
										message:
											'Use `Effect.fn("ServiceName.methodName")(function* (...) { ... })` instead of `Effect.gen` for service methods. `Effect.fn` provides automatic tracing with named spans. (EF-14)'
									})
								);
							}

							// Top-level: check if this Effect.gen is assigned to a variable/export
							if (svcDepth === 0) {
								const parent = (
									node as unknown as {
										parent?: ESTree.Node;
									}
								).parent;
								if (
									parent?.type === 'VariableDeclarator' ||
									parent?.type === 'ExportDefaultDeclaration'
								) {
									yield* ctx.report(
										Diagnostic.make({
											node,
											message:
												'Use `Effect.fn("functionName")(function* (...) { ... })` instead of assigning `Effect.gen(...)` to a variable. `Effect.fn` provides automatic tracing with named spans. (EF-14)'
										})
									);
								}
							}
						}
					}),
				'CallExpression:exit': (node: ESTree.Node) =>
					Effect.gen(function* () {
						const call = node as ESTree.CallExpression;
						if (isServiceDefCall(call)) {
							yield* Ref.update(serviceDefDepth, (n) => n - 1);
							if (hasMakeEffectGen(call)) {
								yield* Ref.update(
									serviceMakeDepth,
									(n) => n - 1
								);
							}
						}
					})
			}
		);
	}
});
