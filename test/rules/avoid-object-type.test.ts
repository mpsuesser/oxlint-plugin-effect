import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-object-type.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-object-type', () => {
	it('flags Object type reference', () => {
		expect(
			Testing.runRule(
				rule,
				'TSTypeReference',
				Testing.tsTypeRef('Object')
			)
		).toHaveLength(1);
	});
	it('allows Record type reference', () => {
		expect(
			Testing.runRule(
				rule,
				'TSTypeReference',
				Testing.tsTypeRef('Record')
			)
		).toHaveLength(0);
	});
	it('flags empty {} type literal', () => {
		expect(
			Testing.runRule(rule, 'TSTypeLiteral', Testing.tsTypeLiteral(0))
		).toHaveLength(1);
	});
	it('allows non-empty type literal', () => {
		expect(
			Testing.runRule(rule, 'TSTypeLiteral', Testing.tsTypeLiteral(2))
		).toHaveLength(0);
	});
});
