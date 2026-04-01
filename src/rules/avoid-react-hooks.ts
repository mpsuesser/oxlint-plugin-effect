import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

const REACT_HOOKS = new Set([
	'useState',
	'useEffect',
	'useReducer',
	'useCallback',
	'useMemo',
	'useRef',
	'useLayoutEffect',
	'useImperativeHandle',
	'useDebugValue',
	'useDeferredValue',
	'useTransition',
	'useId',
	'useSyncExternalStore',
	'useInsertionEffect'
]);

export default Rule.define({
	name: 'avoid-react-hooks',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow React hooks — use View Models with Effect Atom instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			CallExpression: (node: ESTree.Node) => {
				const call = node as ESTree.CallExpression;
				return Option.match(AST.calleeName(call), {
					onNone: () => Effect.void,
					onSome: (name) =>
						REACT_HOOKS.has(name)
							? ctx.report(
									Diagnostic.make({
										node,
										message: `Avoid \`${name}\` — use View Models with Effect Atom instead. State belongs in atoms, effects in actions, components as pure renderers.`
									})
								)
							: Effect.void
				});
			}
		};
	}
});
