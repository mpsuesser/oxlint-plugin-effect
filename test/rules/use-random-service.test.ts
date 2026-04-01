import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-random-service.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('use-random-service', () => {
	it('flags Math.random', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Math', 'random'))
		).toHaveLength(1);
	});
	it('allows Math.floor', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Math', 'floor'))
		).toHaveLength(0);
	});
	it('allows Random.next', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Random', 'next'))
		).toHaveLength(0);
	});
});
