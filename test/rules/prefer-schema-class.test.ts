import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-schema-class.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('prefer-schema-class', () => {
	it('flags Schema.Struct', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Schema', 'Struct'))
		).toHaveLength(1);
	});
	it('allows Schema.Class', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Schema', 'Class'))
		).toHaveLength(0);
	});
	it('allows Schema.String', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Schema', 'String'))
		).toHaveLength(0);
	});
});
