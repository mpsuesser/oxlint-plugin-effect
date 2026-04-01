import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-console-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-console-service', () => {
	it('flags console.log', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'log')
			)
		).toHaveLength(1);
	});
	it('flags console.error', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'error')
			)
		).toHaveLength(1);
	});
	it('flags console.warn', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'warn')
			)
		).toHaveLength(1);
	});
	it('allows Effect.logInfo', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'logInfo')
			)
		).toHaveLength(0);
	});
});
