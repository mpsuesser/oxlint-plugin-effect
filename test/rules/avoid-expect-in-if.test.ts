import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-expect-in-if.ts';
import { callExpr, ifStmt, runRuleMulti } from '../utils.ts';

describe('avoid-expect-in-if', () => {
	it('flags expect() inside if block', () => {
		const errors = runRuleMulti(rule, [
			['IfStatement', ifStmt()],
			['CallExpression', callExpr('expect')],
			['IfStatement:exit', ifStmt()]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows expect() outside if block', () => {
		const errors = runRuleMulti(rule, [
			['CallExpression', callExpr('expect')]
		]);
		expect(errors).toHaveLength(0);
	});

	it('ignores non-expect calls inside if', () => {
		const errors = runRuleMulti(rule, [
			['IfStatement', ifStmt()],
			['CallExpression', callExpr('assert')],
			['IfStatement:exit', ifStmt()]
		]);
		expect(errors).toHaveLength(0);
	});
});
