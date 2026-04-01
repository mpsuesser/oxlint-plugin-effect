import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-untagged-errors.ts';
import { binaryExpr, callExpr, id, newExpr, runRule } from '../utils.ts';

describe('avoid-untagged-errors', () => {
	// ── NewExpression ──
	it('flags new Error()', () => {
		expect(runRule(rule, 'NewExpression', newExpr('Error'))).toHaveLength(
			1
		);
	});

	it('flags new TypeError()', () => {
		expect(
			runRule(rule, 'NewExpression', newExpr('TypeError'))
		).toHaveLength(1);
	});

	it('flags new RangeError()', () => {
		expect(
			runRule(rule, 'NewExpression', newExpr('RangeError'))
		).toHaveLength(1);
	});

	it('allows new MyTaggedError()', () => {
		expect(
			runRule(rule, 'NewExpression', newExpr('MyTaggedError'))
		).toHaveLength(0);
	});

	// ── CallExpression (Error() without new) ──
	it('flags Error() without new', () => {
		expect(runRule(rule, 'CallExpression', callExpr('Error'))).toHaveLength(
			1
		);
	});

	it('flags TypeError() without new', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('TypeError'))
		).toHaveLength(1);
	});

	it('allows myFunction() call', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('myFunction'))
		).toHaveLength(0);
	});

	// ── BinaryExpression (instanceof) ──
	it('flags instanceof Error', () => {
		expect(
			runRule(
				rule,
				'BinaryExpression',
				binaryExpr('instanceof', id('e'), id('Error'))
			)
		).toHaveLength(1);
	});

	it('flags instanceof TypeError', () => {
		expect(
			runRule(
				rule,
				'BinaryExpression',
				binaryExpr('instanceof', id('e'), id('TypeError'))
			)
		).toHaveLength(1);
	});

	it('allows instanceof MyError', () => {
		expect(
			runRule(
				rule,
				'BinaryExpression',
				binaryExpr('instanceof', id('e'), id('MyError'))
			)
		).toHaveLength(0);
	});
});
