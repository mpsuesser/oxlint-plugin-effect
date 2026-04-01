import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-native-object-helpers.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-native-object-helpers', () => {
	it('flags Object.keys', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Object', 'keys')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('R.keys');
	});

	it('flags Object.values', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Object', 'values')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('R.values');
	});

	it('flags Object.entries', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Object', 'entries')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('R.toEntries');
	});

	it('flags Object.fromEntries', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Object', 'fromEntries')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('R.fromEntries');
	});

	it('flags new Map()', () => {
		const errors = Testing.runRule(
			rule,
			'NewExpression',
			Testing.newExpr('Map')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('HashMap');
	});

	it('flags new Set()', () => {
		const errors = Testing.runRule(
			rule,
			'NewExpression',
			Testing.newExpr('Set')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('HashSet');
	});

	it('does not flag Object.assign', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Object', 'assign')
		);
		expect(errors.length).toBe(0);
	});

	it('does not flag new Date()', () => {
		const errors = Testing.runRule(
			rule,
			'NewExpression',
			Testing.newExpr('Date')
		);
		expect(errors.length).toBe(0);
	});
});
