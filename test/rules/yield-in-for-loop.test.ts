import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/yield-in-for-loop.ts';
import {
	forInStmt,
	forOfStmt,
	forStmt,
	id,
	runRuleMulti,
	yieldExpr
} from '../utils.ts';

describe('yield-in-for-loop', () => {
	it('flags yield* inside for loop', () => {
		const errors = runRuleMulti(rule, [
			['ForStatement', forStmt()],
			['YieldExpression', yieldExpr(id('someEffect'), true)],
			['ForStatement:exit', forStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags yield* inside for...in loop', () => {
		const errors = runRuleMulti(rule, [
			['ForInStatement', forInStmt()],
			['YieldExpression', yieldExpr(id('someEffect'), true)],
			['ForInStatement:exit', forInStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags yield* inside for...of loop', () => {
		const errors = runRuleMulti(rule, [
			['ForOfStatement', forOfStmt()],
			['YieldExpression', yieldExpr(id('someEffect'), true)],
			['ForOfStatement:exit', forOfStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows yield* outside for loop', () => {
		const errors = runRuleMulti(rule, [
			['YieldExpression', yieldExpr(id('someEffect'), true)]
		]);
		expect(errors).toHaveLength(0);
	});

	it('ignores non-delegate yield inside for loop', () => {
		const errors = runRuleMulti(rule, [
			['ForStatement', forStmt()],
			['YieldExpression', yieldExpr(id('value'), false)],
			['ForStatement:exit', forStmt()]
		]);
		expect(errors).toHaveLength(0);
	});

	// ── Nested depth tests ──
	it('flags yield* inside nested for loops (depth > 1)', () => {
		const errors = runRuleMulti(rule, [
			['ForStatement', forStmt()],
			['ForOfStatement', forOfStmt()],
			['YieldExpression', yieldExpr(id('someEffect'), true)],
			['ForOfStatement:exit', forOfStmt()],
			['ForStatement:exit', forStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('does not flag yield* after for loop exits (counter reset)', () => {
		const errors = runRuleMulti(rule, [
			['ForStatement', forStmt()],
			['ForStatement:exit', forStmt()],
			['YieldExpression', yieldExpr(id('someEffect'), true)]
		]);
		expect(errors).toHaveLength(0);
	});
});
