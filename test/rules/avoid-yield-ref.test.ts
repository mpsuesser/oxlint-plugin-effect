import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-yield-ref.ts';
import { id, runRule, yieldExpr } from '../utils.ts';

describe('avoid-yield-ref', () => {
	it('flags yield* ref', () => {
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(id('ref'), true))
		).toHaveLength(1);
	});
	it('flags yield* deferred', () => {
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(id('deferred'), true))
		).toHaveLength(1);
	});
	it('flags yield* fiber', () => {
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(id('fiber'), true))
		).toHaveLength(1);
	});
	it('flags yield* latch', () => {
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(id('latch'), true))
		).toHaveLength(1);
	});
	it('allows yield* Ref.get(ref)', () => {
		const refGet = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: id('Ref'),
				property: id('get')
			}
		};
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(refGet, true))
		).toHaveLength(0);
	});
	it('ignores non-delegate yield', () => {
		expect(
			runRule(rule, 'YieldExpression', yieldExpr(id('ref'), false))
		).toHaveLength(0);
	});
});
