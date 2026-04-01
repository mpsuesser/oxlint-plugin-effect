import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-option-over-null.ts';
import { runRule, tsUnionType } from '../utils.ts';

describe('prefer-option-over-null', () => {
	it('flags T | null union', () => {
		const errors = runRule(
			rule,
			'TSUnionType',
			tsUnionType(['TSStringKeyword', 'TSNullKeyword'])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('T | null');
	});

	it('flags T | undefined union', () => {
		const errors = runRule(
			rule,
			'TSUnionType',
			tsUnionType(['TSStringKeyword', 'TSUndefinedKeyword'])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('T | undefined');
	});

	it('flags T | null | undefined union with combined message', () => {
		const errors = runRule(
			rule,
			'TSUnionType',
			tsUnionType([
				'TSStringKeyword',
				'TSNullKeyword',
				'TSUndefinedKeyword'
			])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('T | null | undefined');
	});

	it('allows string | number union', () => {
		expect(
			runRule(
				rule,
				'TSUnionType',
				tsUnionType(['TSStringKeyword', 'TSNumberKeyword'])
			)
		).toHaveLength(0);
	});
});
