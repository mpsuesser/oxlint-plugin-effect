import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-untagged-errors.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-untagged-errors', () => {
	// ── NewExpression ──
	it('flags new Error()', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Error'))
		).toHaveLength(1);
	});

	it('flags new TypeError()', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('TypeError'))
		).toHaveLength(1);
	});

	it('flags new RangeError()', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('RangeError')
			)
		).toHaveLength(1);
	});

	it('allows new MyTaggedError()', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('MyTaggedError')
			)
		).toHaveLength(0);
	});

	// ── CallExpression (Error() without new) ──
	it('flags Error() without new', () => {
		expect(
			Testing.runRule(rule, 'CallExpression', Testing.callExpr('Error'))
		).toHaveLength(1);
	});

	it('flags TypeError() without new', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('TypeError')
			)
		).toHaveLength(1);
	});

	it('allows myFunction() call', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('myFunction')
			)
		).toHaveLength(0);
	});

	// ── BinaryExpression (instanceof) ──
	it('flags instanceof Error', () => {
		expect(
			Testing.runRule(
				rule,
				'BinaryExpression',
				Testing.binaryExpr(
					'instanceof',
					Testing.id('e'),
					Testing.id('Error')
				)
			)
		).toHaveLength(1);
	});

	it('flags instanceof TypeError', () => {
		expect(
			Testing.runRule(
				rule,
				'BinaryExpression',
				Testing.binaryExpr(
					'instanceof',
					Testing.id('e'),
					Testing.id('TypeError')
				)
			)
		).toHaveLength(1);
	});

	it('allows instanceof MyError', () => {
		expect(
			Testing.runRule(
				rule,
				'BinaryExpression',
				Testing.binaryExpr(
					'instanceof',
					Testing.id('e'),
					Testing.id('MyError')
				)
			)
		).toHaveLength(0);
	});
});
