import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-promise-vs-trypromise.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('effect-promise-vs-trypromise', () => {
	it('flags Effect.promise', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Effect', 'promise'))
		).toHaveLength(1);
	});
	it('allows Effect.tryPromise', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Effect', 'tryPromise')
			)
		).toHaveLength(0);
	});
});
