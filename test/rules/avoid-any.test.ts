import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-any.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-any', () => {
	it('flags as any', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSAnyKeyword')
			)
		).toHaveLength(1);
	});
	it('flags as unknown when parent is TSAsExpression (double cast)', () => {
		const node = Testing.tsAsExpr('TSUnknownKeyword', {
			type: 'TSAsExpression'
		});
		expect(Testing.runRule(rule, 'TSAsExpression', node)).toHaveLength(1);
	});
	it('allows as unknown standalone (not double cast)', () => {
		const node = Testing.tsAsExpr('TSUnknownKeyword', {
			type: 'ExpressionStatement'
		});
		expect(Testing.runRule(rule, 'TSAsExpression', node)).toHaveLength(0);
	});
	it('allows as string', () => {
		expect(
			Testing.runRule(
				rule,
				'TSAsExpression',
				Testing.tsAsExpr('TSStringKeyword')
			)
		).toHaveLength(0);
	});
});
