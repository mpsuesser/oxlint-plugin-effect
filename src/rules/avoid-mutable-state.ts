import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-mutable-state',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Flag let bindings — consider using Ref for fiber-safe mutable state in Effect services'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			VariableDeclaration: (node: ESTree.Node) => {
				const decl = node as ESTree.VariableDeclaration;
				if (decl.kind === 'let') {
					return ctx.report(
						Diagnostic.make({
							node,
							message:
								'Consider using `Ref` instead of `let` for mutable state in Effect services. `Ref` provides atomic updates and fiber safety. `let` is acceptable in pure synchronous helpers and narrow scopes.'
						})
					);
				}
				return Effect.void;
			}
		};
	}
});
