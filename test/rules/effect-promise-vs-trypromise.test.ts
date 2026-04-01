import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-promise-vs-trypromise.ts';
import { Testing } from 'effect-oxlint';

describe('effect-promise-vs-trypromise', () => {
	it('flags Effect.promise', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'promise')
			)
		).toHaveLength(1);
	});
	it('allows Effect.tryPromise', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Effect', 'tryPromise')
			)
		).toHaveLength(0);
	});
});
