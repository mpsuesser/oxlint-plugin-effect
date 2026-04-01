import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-any.ts';
import { runRule, tsAsExpr } from '../utils.ts';

describe('avoid-any', () => {
	it('flags as any', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSAnyKeyword'))
		).toHaveLength(1);
	});
	it('flags as unknown when parent is TSAsExpression (double cast)', () => {
		const node = tsAsExpr('TSUnknownKeyword', { type: 'TSAsExpression' });
		expect(runRule(rule, 'TSAsExpression', node)).toHaveLength(1);
	});
	it('allows as unknown standalone (not double cast)', () => {
		const node = tsAsExpr('TSUnknownKeyword', {
			type: 'ExpressionStatement'
		});
		expect(runRule(rule, 'TSAsExpression', node)).toHaveLength(0);
	});
	it('allows as string', () => {
		expect(
			runRule(rule, 'TSAsExpression', tsAsExpr('TSStringKeyword'))
		).toHaveLength(0);
	});
});
