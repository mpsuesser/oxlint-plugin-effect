import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-effect-is.ts';
import { binaryExpr, strLiteral, unaryExpr, runRule } from '../utils.ts';

describe('prefer-effect-is', () => {
	it('flags typeof x === "string"', () => {
		const node = binaryExpr(
			'===',
			unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			strLiteral('string')
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('P.isString');
	});

	it('flags "number" === typeof x (reversed)', () => {
		const node = binaryExpr(
			'===',
			strLiteral('number'),
			unaryExpr('typeof', { type: 'Identifier', name: 'x' })
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('P.isNumber');
	});

	it('flags typeof x !== "boolean"', () => {
		const node = binaryExpr(
			'!==',
			unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			strLiteral('boolean')
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('P.isBoolean');
	});

	it('flags typeof x === "bigint"', () => {
		const node = binaryExpr(
			'===',
			unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			strLiteral('bigint')
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('P.isBigInt');
	});

	it('does not flag non-typeof comparisons', () => {
		const node = binaryExpr('===', strLiteral('foo'), strLiteral('bar'));
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag == operator (only strict equality)', () => {
		const node = binaryExpr(
			'==',
			unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			strLiteral('string')
		);
		const errors = runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});
});
