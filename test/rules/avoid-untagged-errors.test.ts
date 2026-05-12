import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-untagged-errors.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-untagged-errors', () => {
	// ── NewExpression — only bare `Error` is flagged ──
	it('flags `new Error(...)`', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Error'))
		).toHaveLength(1);
	});

	it('allows `new TypeError(...)` (invariant defects are legitimate)', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('TypeError'))
		).toHaveLength(0);
	});

	it('allows `new RangeError(...)`', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('RangeError')
			)
		).toHaveLength(0);
	});

	it('allows `new MyTaggedError(...)`', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('MyTaggedError')
			)
		).toHaveLength(0);
	});

	// ── CallExpression — bare-call form not flagged (pattern is narrow) ──
	it('allows `Error(...)` without `new` (out of scope per pattern)', () => {
		expect(
			Testing.runRule(rule, 'CallExpression', Testing.callExpr('Error'))
		).toHaveLength(0);
	});

	// ── BinaryExpression `instanceof` — only `Error` on the right ──
	it('flags `e instanceof Error`', () => {
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

	it('allows `e instanceof TypeError`', () => {
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
		).toHaveLength(0);
	});

	it('allows `e instanceof MyError`', () => {
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

	it('allows `x === y` (non-instanceof binary)', () => {
		expect(
			Testing.runRule(
				rule,
				'BinaryExpression',
				Testing.binaryExpr('===', Testing.id('x'), Testing.id('y'))
			)
		).toHaveLength(0);
	});
});
