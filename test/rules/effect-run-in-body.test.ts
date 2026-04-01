import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-run-in-body.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('effect-run-in-body', () => {
	it('flags Effect.runSync', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Effect', 'runSync'))
		).toHaveLength(1);
	});
	it('flags Effect.runPromise', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Effect', 'runPromise')
			)
		).toHaveLength(1);
	});
	it('flags Effect.runFork', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Effect', 'runFork'))
		).toHaveLength(1);
	});
	it('allows Effect.gen', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Effect', 'gen'))
		).toHaveLength(0);
	});
});
