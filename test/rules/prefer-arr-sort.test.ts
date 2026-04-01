import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-arr-sort.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-arr-sort', () => {
	it('flags items.sort()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('items', 'sort')
			)
		).toHaveLength(1);
	});
	it('allows Arr.sort()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('Arr', 'sort')
			)
		).toHaveLength(0);
	});
	it('ignores non-sort member calls', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('items', 'filter')
			)
		).toHaveLength(0);
	});
});
