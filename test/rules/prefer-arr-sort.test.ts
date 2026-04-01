import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/prefer-arr-sort.ts';
import { callOfMember, runRule } from '../utils.ts';

describe('prefer-arr-sort', () => {
	it('flags items.sort()', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('items', 'sort'))
		).toHaveLength(1);
	});
	it('allows Arr.sort()', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('Arr', 'sort'))
		).toHaveLength(0);
	});
	it('ignores non-sort member calls', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('items', 'filter'))
		).toHaveLength(0);
	});
});
