import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-direct-json.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('avoid-direct-json', () => {
	it('flags JSON.parse', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('JSON', 'parse'))
		).toHaveLength(1);
	});
	it('flags JSON.stringify', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('JSON', 'stringify'))
		).toHaveLength(1);
	});
	it('allows Schema.fromJsonString', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Schema', 'fromJsonString')
			)
		).toHaveLength(0);
	});
});
