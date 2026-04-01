import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-object-type.ts';
import { runRule, tsTypeLiteral, tsTypeRef } from '../utils.ts';

describe('avoid-object-type', () => {
	it('flags Object type reference', () => {
		expect(
			runRule(rule, 'TSTypeReference', tsTypeRef('Object'))
		).toHaveLength(1);
	});
	it('allows Record type reference', () => {
		expect(
			runRule(rule, 'TSTypeReference', tsTypeRef('Record'))
		).toHaveLength(0);
	});
	it('flags empty {} type literal', () => {
		expect(runRule(rule, 'TSTypeLiteral', tsTypeLiteral(0))).toHaveLength(
			1
		);
	});
	it('allows non-empty type literal', () => {
		expect(runRule(rule, 'TSTypeLiteral', tsTypeLiteral(2))).toHaveLength(
			0
		);
	});
});
