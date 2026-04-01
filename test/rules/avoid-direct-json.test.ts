import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-direct-json.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-direct-json', () => {
	it('flags JSON.parse', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('JSON', 'parse')
			)
		).toHaveLength(1);
	});
	it('flags JSON.stringify', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('JSON', 'stringify')
			)
		).toHaveLength(1);
	});
	it('allows Schema.fromJsonString', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Schema', 'fromJsonString')
			)
		).toHaveLength(0);
	});
});
