import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/use-console-service.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('use-console-service', () => {
	it('flags console.log', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('console', 'log'))
		).toHaveLength(1);
	});
	it('flags console.error', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('console', 'error'))
		).toHaveLength(1);
	});
	it('flags console.warn', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('console', 'warn'))
		).toHaveLength(1);
	});
	it('allows Effect.logInfo', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Effect', 'logInfo'))
		).toHaveLength(0);
	});
});
