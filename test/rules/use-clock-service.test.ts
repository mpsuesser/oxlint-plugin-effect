import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/use-clock-service.ts';
import { memberExpr, newExpr, runRule } from '../utils.ts';

describe('use-clock-service', () => {
	it('flags new Date() (no arguments = current time)', () => {
		expect(runRule(rule, 'NewExpression', newExpr('Date'))).toHaveLength(1);
	});
	it('allows new Date(timestamp) (conversion, not current time)', () => {
		expect(
			runRule(
				rule,
				'NewExpression',
				newExpr('Date', [{ type: 'Literal', value: 1234567890 }])
			)
		).toHaveLength(0);
	});
	it('allows new Date(string) (parsing, not current time)', () => {
		expect(
			runRule(
				rule,
				'NewExpression',
				newExpr('Date', [{ type: 'Literal', value: '2024-01-01' }])
			)
		).toHaveLength(0);
	});
	it('allows new Map()', () => {
		expect(runRule(rule, 'NewExpression', newExpr('Map'))).toHaveLength(0);
	});
	it('flags Date.now', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Date', 'now'))
		).toHaveLength(1);
	});
	it('flags Date.parse', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Date', 'parse'))
		).toHaveLength(1);
	});
	it('flags Date.UTC', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Date', 'UTC'))
		).toHaveLength(1);
	});
	it('allows DateTime.now', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('DateTime', 'now'))
		).toHaveLength(0);
	});
});
