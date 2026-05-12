import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-console-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-console-service', () => {
	// ── Common methods ──
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

	it('flags console.info', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'info')
			)
		).toHaveLength(1);
	});

	it('flags console.debug', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'debug')
			)
		).toHaveLength(1);
	});

	it('flags console.trace', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'trace')
			)
		).toHaveLength(1);
	});

	// ── Less-common methods (the previous allowlist missed these) ──
	it('flags console.table', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'table')
			)
		).toHaveLength(1);
	});

	it('flags console.dir', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'dir')
			)
		).toHaveLength(1);
	});

	it('flags console.group', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'group')
			)
		).toHaveLength(1);
	});

	it('flags console.time', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'time')
			)
		).toHaveLength(1);
	});

	it('flags console.assert', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'assert')
			)
		).toHaveLength(1);
	});

	it('flags console.count', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('console', 'count')
			)
		).toHaveLength(1);
	});

	// ── Negative: non-console receivers ──
	it('allows Effect.logInfo', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'logInfo')
			)
		).toHaveLength(0);
	});

	it('allows Console.log (the Effect service, not the global)', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Console', 'log')
			)
		).toHaveLength(0);
	});

	// ── Negative: computed access ──
	it("allows computed `console['log']` (computed access is excluded)", () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.computedMemberExpr('console', 'log')
			)
		).toHaveLength(0);
	});
});
