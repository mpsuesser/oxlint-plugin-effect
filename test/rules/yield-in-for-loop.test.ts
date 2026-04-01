import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/yield-in-for-loop.ts';
import { Testing } from 'effect-oxlint';

describe('yield-in-for-loop', () => {
	it('flags yield* inside for loop', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForStatement', Testing.forStmt()],
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			],
			['ForStatement:exit', Testing.forStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags yield* inside for...in loop', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForInStatement', Testing.forInStmt()],
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			],
			['ForInStatement:exit', Testing.forInStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags yield* inside for...of loop', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForOfStatement', Testing.forOfStmt()],
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			],
			['ForOfStatement:exit', Testing.forOfStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows yield* outside for loop', () => {
		const errors = Testing.runRuleMulti(rule, [
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			]
		]);
		expect(errors).toHaveLength(0);
	});

	it('ignores non-delegate yield inside for loop', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForStatement', Testing.forStmt()],
			['YieldExpression', Testing.yieldExpr(Testing.id('value'), false)],
			['ForStatement:exit', Testing.forStmt()]
		]);
		expect(errors).toHaveLength(0);
	});

	// ── Nested depth tests ──
	it('flags yield* inside nested for loops (depth > 1)', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForStatement', Testing.forStmt()],
			['ForOfStatement', Testing.forOfStmt()],
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			],
			['ForOfStatement:exit', Testing.forOfStmt()],
			['ForStatement:exit', Testing.forStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('does not flag yield* after for loop exits (counter reset)', () => {
		const errors = Testing.runRuleMulti(rule, [
			['ForStatement', Testing.forStmt()],
			['ForStatement:exit', Testing.forStmt()],
			[
				'YieldExpression',
				Testing.yieldExpr(Testing.id('someEffect'), true)
			]
		]);
		expect(errors).toHaveLength(0);
	});
});
