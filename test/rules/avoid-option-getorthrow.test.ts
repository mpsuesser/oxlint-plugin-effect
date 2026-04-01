import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-option-getorthrow.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('avoid-option-getorthrow', () => {
	it('flags Option.getOrThrow', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Option', 'getOrThrow')
			)
		).toHaveLength(1);
	});
	it('allows Option.getOrElse', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Option', 'getOrElse'))
		).toHaveLength(0);
	});
	it('allows Option.match', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Option', 'match'))
		).toHaveLength(0);
	});
});
