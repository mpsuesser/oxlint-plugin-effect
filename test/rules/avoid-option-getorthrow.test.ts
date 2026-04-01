import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-option-getorthrow.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-option-getorthrow', () => {
	it('flags Option.getOrThrow', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'getOrThrow')
			)
		).toHaveLength(1);
	});
	it('allows Option.getOrElse', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'getOrElse')
			)
		).toHaveLength(0);
	});
	it('allows Option.match', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Option', 'match')
			)
		).toHaveLength(0);
	});
});
