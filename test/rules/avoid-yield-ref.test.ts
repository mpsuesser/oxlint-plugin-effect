import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-yield-ref.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-yield-ref', () => {
	it('flags yield* ref', () => {
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(Testing.id('ref'), true)
			)
		).toHaveLength(1);
	});
	it('flags yield* deferred', () => {
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(Testing.id('deferred'), true)
			)
		).toHaveLength(1);
	});
	it('flags yield* fiber', () => {
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(Testing.id('fiber'), true)
			)
		).toHaveLength(1);
	});
	it('flags yield* latch', () => {
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(Testing.id('latch'), true)
			)
		).toHaveLength(1);
	});
	it('allows yield* Ref.get(ref)', () => {
		const refGet = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Ref'),
				property: Testing.id('get')
			}
		};
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(refGet, true)
			)
		).toHaveLength(0);
	});
	it('ignores non-delegate yield', () => {
		expect(
			Testing.runRule(
				rule,
				'YieldExpression',
				Testing.yieldExpr(Testing.id('ref'), false)
			)
		).toHaveLength(0);
	});
});
