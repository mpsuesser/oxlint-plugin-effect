import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-expect-in-if.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-expect-in-if', () => {
	it('flags expect() inside if block', () => {
		const errors = Testing.runRuleMulti(rule, [
			['IfStatement', Testing.ifStmt()],
			['CallExpression', Testing.callExpr('expect')],
			['IfStatement:exit', Testing.ifStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows expect() outside if block', () => {
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', Testing.callExpr('expect')]
		]);
		expect(errors).toHaveLength(0);
	});

	it('ignores non-expect calls inside if', () => {
		const errors = Testing.runRuleMulti(rule, [
			['IfStatement', Testing.ifStmt()],
			['CallExpression', Testing.callExpr('assert')],
			['IfStatement:exit', Testing.ifStmt()]
		]);
		expect(errors).toHaveLength(0);
	});
});
