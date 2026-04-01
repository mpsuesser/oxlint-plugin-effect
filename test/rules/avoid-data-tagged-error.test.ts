import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-data-tagged-error.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-data-tagged-error', () => {
	it('flags Data.TaggedError', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Data', 'TaggedError')
			)
		).toHaveLength(1);
	});
	it('allows Schema.TaggedErrorClass', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Schema', 'TaggedErrorClass')
			)
		).toHaveLength(0);
	});
	it('allows Data.Struct', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Data', 'Struct')
			)
		).toHaveLength(0);
	});
});
