import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-effect-fn.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-effect-fn', () => {
	it('flags Effect.gen inside Context.Service definition', () => {
		const serviceInner = Testing.callOfMember('Context', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectGen = Testing.callOfMember('Effect', 'gen');

		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows Effect.gen outside Context.Service', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows Effect.fn inside Context.Service', () => {
		const serviceInner = Testing.callOfMember('Context', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectFn = Testing.callOfMember('Effect', 'fn');
		const effectGen = Testing.callOfMember('Effect', 'gen');

		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', effectFn],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', effectFn],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows Effect.fnUntraced inside Context.Service', () => {
		const serviceInner = Testing.callOfMember('Context', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const effectFnUntraced = Testing.callOfMember('Effect', 'fnUntraced');
		const effectGen = Testing.callOfMember('Effect', 'gen');

		const errors = Testing.runRuleMulti(rule, [
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
