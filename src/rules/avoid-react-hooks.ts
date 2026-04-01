import type { CreateRule, Visitor } from '@oxlint/plugins';

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

const rule: CreateRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow React hooks — use View Models with Effect Atom instead'
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					REACT_HOOKS.has(node.callee.name)
				) {
					context.report({
						node,
						message: `Avoid \`${node.callee.name}\` — use View Models with Effect Atom instead. State belongs in atoms, effects in actions, components as pure renderers.`
					});
				}
			}
		} satisfies Visitor;
	}
};

export default rule;
