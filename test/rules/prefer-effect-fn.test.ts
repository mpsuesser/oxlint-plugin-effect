import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/prefer-effect-fn.ts';
import { callOfMember, runRuleMulti } from '../utils.ts';

describe('prefer-effect-fn', () => {
	it('flags Effect.gen inside ServiceMap.Service definition', () => {
		const serviceInner = callOfMember('ServiceMap', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectGen = callOfMember('Effect', 'gen');

		const errors = runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows Effect.gen outside ServiceMap.Service', () => {
		const effectGen = callOfMember('Effect', 'gen');
		const errors = runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows Effect.fn inside ServiceMap.Service', () => {
		const serviceInner = callOfMember('ServiceMap', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectFn = callOfMember('Effect', 'fn');
		const effectGen = callOfMember('Effect', 'gen');

		const errors = runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', effectFn],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', effectFn],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows Effect.fnUntraced inside ServiceMap.Service', () => {
		const serviceInner = callOfMember('ServiceMap', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectFnUntraced = callOfMember('Effect', 'fnUntraced');
		const effectGen = callOfMember('Effect', 'gen');

		const errors = runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', effectFnUntraced],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', effectFnUntraced],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(0);
	});
});
