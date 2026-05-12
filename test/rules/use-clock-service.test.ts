import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-clock-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-clock-service', () => {
	// ── NewExpression ──
	it('flags `new Date()` (current time)', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Date'))
		).toHaveLength(1);
	});

	it('flags `new Date(timestamp)` (parse-from-number)', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('Date', [
					{ type: 'Literal', value: 1234567890 }
				])
			)
		).toHaveLength(1);
	});

	it('flags `new Date(string)` (parse-from-string)', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('Date', [
					{ type: 'Literal', value: '2024-01-01' }
				])
			)
		).toHaveLength(1);
	});

	it('flags `new Date(y, m, d)` (component constructor)', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('Date', [
					{ type: 'Literal', value: 2024 },
					{ type: 'Literal', value: 0 },
					{ type: 'Literal', value: 1 }
				])
			)
		).toHaveLength(1);
	});

	it('allows `new Map()`', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Map'))
		).toHaveLength(0);
	});

	it('allows `new DateTime(...)` (unrelated identifier)', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('DateTime'))
		).toHaveLength(0);
	});

	// ── MemberExpression — covers every `Date.*` static ──
	it('flags `Date.now`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'now')
			)
		).toHaveLength(1);
	});

	it('flags `Date.parse`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'parse')
			)
		).toHaveLength(1);
	});

	it('flags `Date.UTC`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'UTC')
			)
		).toHaveLength(1);
	});

	it('flags any other `Date.<static>` (e.g. `Date.fromTimestamp`)', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'fromTimestamp')
			)
		).toHaveLength(1);
	});

	it('allows `DateTime.now`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('DateTime', 'now')
			)
		).toHaveLength(0);
	});

	it('allows `Clock.currentTimeMillis`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Clock', 'currentTimeMillis')
			)
		).toHaveLength(0);
	});
});
