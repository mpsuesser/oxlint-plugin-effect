/**
 * View Model definitions must live in `*.vm.ts(x)` files, keeping
 * rendering and state management separated. This rule flags VM-shaped
 * definitions appearing anywhere else.
 *
 * Detected shapes:
 *  - `interface FooVM { ... }` — the canonical VM type definition
 *  - `class FooVM extends Context.Service<FooVM>()(...)` — the service
 *    wrapping a VM (detection looks at the type argument's name)
 *  - `Layer.effect(FooVM, ...)` / `Layer.scoped(FooVM, ...)` — building
 *    a VM-tagged layer
 *
 * Detection is purely name-based ("ends with VM"), which is the
 * project's naming convention for view-model types.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const LayerFactoryName = Schema.Literals(['effect', 'scoped']).annotate({
	title: 'LayerFactoryName',
	description:
		'`Layer.effect` and `Layer.scoped` — the factory positions where a VM tag appears as the first argument.'
});

const isLayerFactoryName = Schema.is(LayerFactoryName);

const VmName = Schema.String.check(
	Schema.makeFilter((s: string) => Str.endsWith('VM')(s), {
		identifier: 'VmNameCheck',
		title: 'VM name',
		description: 'A name ending with the suffix `VM`.',
		message: 'Name must end with VM'
	})
).pipe(
	Schema.brand('VmName'),
	Schema.annotate({
		title: 'VmName',
		description:
			'A type/identifier name following the View Model naming convention (`...VM`).'
	})
);

const isVmName = Schema.is(VmName);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

const interfaceName = (node: ESTree.TSInterfaceDeclaration): string =>
	node.id.name;

/**
 * The first type argument of `Context.Service<FooVM>` — returns the
 * identifier name when it exists and is a bare identifier reference.
 */
const contextServiceTypeArgumentName = (
	node: ESTree.CallExpression
): Option.Option<string> =>
	pipe(
		AST.narrow(node.callee, 'CallExpression'),
		Option.filter(
			(inner) =>
				inner.callee.type === 'MemberExpression' &&
				AST.isMember(inner.callee, 'Context', 'Service')
		),
		Option.flatMap((inner) =>
			Option.fromNullishOr(inner.typeArguments?.params[0])
		),
		Option.flatMap(AST.narrow('TSTypeReference')),
		Option.flatMap((ref) =>
			ref.typeName.type === 'Identifier'
				? Option.some(ref.typeName.name)
				: Option.none()
		)
	);

/**
 * The first positional argument of `Layer.effect|scoped(FooVM, ...)` —
 * returns the identifier name when the argument is a bare identifier.
 */
const layerFactoryFirstArgumentName = (
	node: ESTree.CallExpression
): Option.Option<string> =>
	pipe(
		AST.narrow(node.callee, 'MemberExpression'),
		Option.flatMap(AST.memberNames),
		Option.filter(
			([obj, prop]) => obj === 'Layer' && isLayerFactoryName(prop)
		),
		Option.flatMap(() => Option.fromNullishOr(node.arguments[0])),
		Option.flatMap(AST.narrow('Identifier')),
		Option.map((id) => id.name)
	);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const interfaceMessage = (name: string, suggestedFile: string): string =>
	`View Model interface \`${name}\` must be in a \`.vm.ts\` file. Move it to \`${suggestedFile}\` to keep rendering and state management separated.`;

const layerMessage = (factory: string, name: string): string =>
	`View Model layer \`Layer.${factory}(${name}, ...)\` must be in a \`.vm.ts\` file. Move it to keep rendering and state management separated.`;

const serviceMessage = (name: string): string =>
	`View Model service \`Context.Service<${name}>(...)\` must be defined in a \`.vm.ts\` file. Move it to keep rendering and state management separated.`;

const vmFileSuggestion = (filename: string): string =>
	filename.replace(/\.(ts|tsx)$/, '.vm.$1');

export default Rule.define({
	name: 'vm-in-wrong-file',
	meta: Rule.meta({
		type: 'problem',
		description:
			'View Model definitions (`interface FooVM`, `Context.Service<FooVM>(...)`, `Layer.effect(FooVM, ...)`) must live in `.vm.ts` / `.vm.tsx` files.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return yield* Visitor.filter(
			(filename) =>
				!filename.endsWith('.vm.ts') && !filename.endsWith('.vm.tsx'),
			Visitor.merge(
				Visitor.on('TSInterfaceDeclaration', (node) =>
					isVmName(interfaceName(node))
						? ctx.report(
								Diagnostic.make({
									node,
									message: interfaceMessage(
										interfaceName(node),
										vmFileSuggestion(ctx.filename)
									)
								})
							)
						: Effect.void
				),
				Visitor.on('CallExpression', (node) =>
					pipe(
						contextServiceTypeArgumentName(node),
						Option.filter(isVmName),
						Option.match({
							onNone: () => Effect.void,
							onSome: (name) =>
								ctx.report(
									Diagnostic.make({
										node,
										message: serviceMessage(name)
									})
								)
						})
					)
				),
				Visitor.on('CallExpression', (node) =>
					pipe(
						AST.narrow(node.callee, 'MemberExpression'),
						Option.flatMap(AST.memberNames),
						Option.filter(([, prop]) => isLayerFactoryName(prop)),
						Option.flatMap(([, factory]) =>
							pipe(
								layerFactoryFirstArgumentName(node),
								Option.filter(isVmName),
								Option.map((name) => [factory, name] as const)
							)
						),
						Option.match({
							onNone: () => Effect.void,
							onSome: ([factory, name]) =>
								ctx.report(
									Diagnostic.make({
										node,
										message: layerMessage(factory, name)
									})
								)
						})
					)
				)
			)
		);
	}
});
