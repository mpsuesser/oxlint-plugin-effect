import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-schema-class.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-schema-class', () => {
	it('flags Schema.Struct', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Schema', 'Struct')
			)
		).toHaveLength(1);
	});
	it('allows Schema.Class', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Schema', 'Class')
			)
		).toHaveLength(0);
	});
	it('allows Schema.String', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Schema', 'String')
			)
		).toHaveLength(0);
	});
});
