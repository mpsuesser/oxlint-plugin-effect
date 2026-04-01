import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-effect-is.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-effect-is', () => {
	it('flags typeof x === "string"', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			Testing.strLiteral('string')
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('P.isString');
	});

	it('flags "number" === typeof x (reversed)', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.strLiteral('number'),
			Testing.unaryExpr('typeof', { type: 'Identifier', name: 'x' })
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('P.isNumber');
	});

	it('flags typeof x !== "boolean"', () => {
		const node = Testing.binaryExpr(
			'!==',
			Testing.unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			Testing.strLiteral('boolean')
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('P.isBoolean');
	});

	it('flags typeof x === "bigint"', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			Testing.strLiteral('bigint')
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('P.isBigInt');
	});

	it('does not flag non-typeof comparisons', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.strLiteral('foo'),
			Testing.strLiteral('bar')
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag == operator (only strict equality)', () => {
		const node = Testing.binaryExpr(
			'==',
			Testing.unaryExpr('typeof', { type: 'Identifier', name: 'x' }),
			Testing.strLiteral('string')
		);
		const errors = Testing.runRule(rule, 'BinaryExpression', node);
		expect(errors.length).toBe(0);
	});
});
