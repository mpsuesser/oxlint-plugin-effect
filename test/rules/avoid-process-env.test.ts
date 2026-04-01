import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-process-env.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-process-env', () => {
	it('flags process.env', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('process', 'env')
			)
		).toHaveLength(1);
	});
	it('allows Config.string', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Config', 'string')
			)
		).toHaveLength(0);
	});
});
