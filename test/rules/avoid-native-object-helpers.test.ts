import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-native-object-helpers.ts';
import { memberExpr, newExpr, runRule } from '../utils.ts';

describe('avoid-native-object-helpers', () => {
	it('flags Object.keys', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Object', 'keys')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('R.keys');
	});

	it('flags Object.values', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Object', 'values')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('R.values');
	});

	it('flags Object.entries', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Object', 'entries')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('R.toEntries');
	});

	it('flags Object.fromEntries', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Object', 'fromEntries')
		);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('R.fromEntries');
	});

	it('flags new Map()', () => {
		const errors = runRule(rule, 'NewExpression', newExpr('Map'));
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('HashMap');
	});

	it('flags new Set()', () => {
		const errors = runRule(rule, 'NewExpression', newExpr('Set'));
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('HashSet');
	});

	it('does not flag Object.assign', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Object', 'assign')
		);
		expect(errors.length).toBe(0);
	});

	it('does not flag new Date()', () => {
		const errors = runRule(rule, 'NewExpression', newExpr('Date'));
		expect(errors.length).toBe(0);
	});
});
