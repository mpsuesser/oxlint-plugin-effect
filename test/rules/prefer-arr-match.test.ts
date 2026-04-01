import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/prefer-arr-match.ts';
import { binaryExpr, runRule } from '../utils.ts';

describe('prefer-arr-match', () => {
	const lengthAccess = () =>
		({
			type: 'MemberExpression',
			object: { type: 'Identifier', name: 'items' },
			property: { type: 'Identifier', name: 'length' }
		}) as const;

	const zero = () => ({ type: 'Literal', value: 0 }) as const;
	const one = () => ({ type: 'Literal', value: 1 }) as const;

	it('flags items.length === 0', () => {
		const node = binaryExpr('===', lengthAccess(), zero());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('Arr.match');
	});

	it('flags items.length !== 0', () => {
		const node = binaryExpr('!==', lengthAccess(), zero());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
	});

	it('flags items.length > 0', () => {
		const node = binaryExpr('>', lengthAccess(), zero());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
	});

	it('flags 0 === items.length (reversed)', () => {
		const node = binaryExpr('===', zero(), lengthAccess());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
	});

	it('flags items.length >= 1', () => {
		const node = binaryExpr('>=', lengthAccess(), one());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
	});

	it('flags items.length < 1', () => {
		const node = binaryExpr('<', lengthAccess(), one());
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
	});

	it('does not flag items.length === 5', () => {
		const node = binaryExpr('===', lengthAccess(), {
			type: 'Literal',
			value: 5
		});
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag unrelated binary expressions', () => {
		const node = binaryExpr(
			'===',
			{ type: 'Identifier', name: 'a' },
			{ type: 'Identifier', name: 'b' }
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});
});
