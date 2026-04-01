import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-run-in-body.ts';
import { Testing } from 'effect-oxlint';

describe('effect-run-in-body', () => {
	it('flags Effect.runSync', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'runSync')
			)
		).toHaveLength(1);
	});
	it('flags Effect.runPromise', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'runPromise')
			)
		).toHaveLength(1);
	});
	it('flags Effect.runFork', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'runFork')
			)
		).toHaveLength(1);
	});
	it('allows Effect.gen', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'gen')
			)
		).toHaveLength(0);
	});
});
