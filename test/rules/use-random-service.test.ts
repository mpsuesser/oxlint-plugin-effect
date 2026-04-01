import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-random-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-random-service', () => {
	it('flags Math.random', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Math', 'random')
			)
		).toHaveLength(1);
	});
	it('allows Math.floor', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Math', 'floor')
			)
		).toHaveLength(0);
	});
	it('allows Random.next', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Random', 'next')
			)
		).toHaveLength(0);
	});
});
