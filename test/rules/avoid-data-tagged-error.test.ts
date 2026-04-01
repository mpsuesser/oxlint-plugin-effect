import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-data-tagged-error.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('avoid-data-tagged-error', () => {
	it('flags Data.TaggedError', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Data', 'TaggedError'))
		).toHaveLength(1);
	});
	it('allows Schema.TaggedErrorClass', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Schema', 'TaggedErrorClass')
			)
		).toHaveLength(0);
	});
	it('allows Data.Struct', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Data', 'Struct'))
		).toHaveLength(0);
	});
});
