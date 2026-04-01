import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-option-over-null.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-option-over-null', () => {
	it('flags T | null union', () => {
		const errors = Testing.runRule(
			rule,
			'TSUnionType',
			Testing.tsUnionType(['TSStringKeyword', 'TSNullKeyword'])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('T | null');
	});

	it('flags T | undefined union', () => {
		const errors = Testing.runRule(
			rule,
			'TSUnionType',
			Testing.tsUnionType(['TSStringKeyword', 'TSUndefinedKeyword'])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('T | undefined');
	});

	it('flags T | null | undefined union with combined message', () => {
		const errors = Testing.runRule(
			rule,
			'TSUnionType',
			Testing.tsUnionType([
				'TSStringKeyword',
				'TSNullKeyword',
				'TSUndefinedKeyword'
			])
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('T | null | undefined');
	});

	it('allows string | number union', () => {
		expect(
			Testing.runRule(
				rule,
				'TSUnionType',
				Testing.tsUnionType(['TSStringKeyword', 'TSNumberKeyword'])
			)
		).toHaveLength(0);
	});
});
