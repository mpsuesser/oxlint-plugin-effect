import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-react-hooks.ts';
import { callExpr, runRule } from '../utils.ts';

describe('avoid-react-hooks', () => {
	it('flags useState', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useState'))
		).toHaveLength(1);
	});
	it('flags useEffect', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useEffect'))
		).toHaveLength(1);
	});
	it('flags useCallback', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useCallback'))
		).toHaveLength(1);
	});
	it('flags useMemo', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useMemo'))
		).toHaveLength(1);
	});
	it('allows useAtomValue (custom hook)', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useAtomValue'))
		).toHaveLength(0);
	});
	it('allows custom hooks not in the list', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('useCustomHook'))
		).toHaveLength(0);
	});
});
