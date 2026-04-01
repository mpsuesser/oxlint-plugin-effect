import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-clock-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-clock-service', () => {
	it('flags new Date() (no arguments = current time)', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Date'))
		).toHaveLength(1);
	});
	it('allows new Date(timestamp) (conversion, not current time)', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('Date', [
					{ type: 'Literal', value: 1234567890 }
				])
			)
		).toHaveLength(0);
	});
	it('allows new Date(string) (parsing, not current time)', () => {
		expect(
			Testing.runRule(
				rule,
				'NewExpression',
				Testing.newExpr('Date', [
					{ type: 'Literal', value: '2024-01-01' }
				])
			)
		).toHaveLength(0);
	});
	it('allows new Map()', () => {
		expect(
			Testing.runRule(rule, 'NewExpression', Testing.newExpr('Map'))
		).toHaveLength(0);
	});
	it('flags Date.now', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'now')
			)
		).toHaveLength(1);
	});
	it('flags Date.parse', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'parse')
			)
		).toHaveLength(1);
	});
	it('flags Date.UTC', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Date', 'UTC')
			)
		).toHaveLength(1);
	});
	it('allows DateTime.now', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('DateTime', 'now')
			)
		).toHaveLength(0);
	});
});
