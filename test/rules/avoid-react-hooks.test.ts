import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-react-hooks.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-react-hooks', () => {
	it('flags useState', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('useState')
			)
		).toHaveLength(1);
	});
	it('flags useEffect', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('useEffect')
			)
		).toHaveLength(1);
	});
	it('flags useCallback', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('useCallback')
			)
		).toHaveLength(1);
	});
	it('flags useMemo', () => {
		expect(
			Testing.runRule(rule, 'CallExpression', Testing.callExpr('useMemo'))
		).toHaveLength(1);
	});
	it('allows useAtomValue (custom hook)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('useAtomValue')
			)
		).toHaveLength(0);
	});
	it('allows custom hooks not in the list', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('useCustomHook')
			)
		).toHaveLength(0);
	});
});
