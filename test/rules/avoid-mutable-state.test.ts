import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-mutable-state.ts';
import { Testing } from 'effect-oxlint';

const layerCall = (factory: 'effect' | 'scoped' | 'succeed') =>
	Testing.callOfMember('Layer', factory);

const contextServiceMakeCall = () => {
	const serviceInner = Testing.callOfMember('Context', 'Service');
	return {
		type: 'CallExpression',
		callee: serviceInner,
		arguments: [
			{ type: 'Literal', value: '@app/Foo' },
			{
				type: 'ObjectExpression',
				properties: [
					{
						type: 'Property',
						key: { type: 'Identifier', name: 'make' },
						value: Testing.callOfMember('Effect', 'gen')
					}
				]
			}
		]
	};
};

const contextServiceNoMakeCall = () => {
	const serviceInner = Testing.callOfMember('Context', 'Service');
	return {
		type: 'CallExpression',
		callee: serviceInner,
		arguments: [{ type: 'Literal', value: '@app/Foo' }]
	};
};

describe('avoid-mutable-state', () => {
	it('allows `let` outside service factories', () => {
		const errors = Testing.runRuleMulti(rule, [
			['VariableDeclaration', Testing.varDecl('let', 'x')]
		]);
		expect(errors).toHaveLength(0);
	});

	it('allows `const` everywhere', () => {
		const layer = layerCall('effect');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['VariableDeclaration', Testing.varDecl('const', 'x')],
			['CallExpression:exit', layer]
		]);
		expect(errors).toHaveLength(0);
	});

	it('flags `let` inside Layer.effect', () => {
		const layer = layerCall('effect');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', layer]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags `let` inside Layer.scoped', () => {
		const layer = layerCall('scoped');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', layer]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags `let` inside Layer.succeed', () => {
		const layer = layerCall('succeed');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', layer]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags `let` inside Context.Service make block', () => {
		const svc = contextServiceMakeCall();
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', svc],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', svc]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows `let` inside Context.Service without a make property', () => {
		const svc = contextServiceNoMakeCall();
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', svc],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', svc]
		]);
		expect(errors).toHaveLength(0);
	});

	it('ignores other Layer.* helpers (e.g. Layer.provide)', () => {
		const other = Testing.callOfMember('Layer', 'provide');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', other],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', other]
		]);
		expect(errors).toHaveLength(0);
	});

	it('resets after the factory exits', () => {
		const layer = layerCall('effect');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['CallExpression:exit', layer],
			['VariableDeclaration', Testing.varDecl('let', 'x')]
		]);
		expect(errors).toHaveLength(0);
	});

	it('handles nested layer/service factories', () => {
		const layer = layerCall('effect');
		const svc = contextServiceMakeCall();
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layer],
			['CallExpression', svc],
			['VariableDeclaration', Testing.varDecl('let', 'x')],
			['CallExpression:exit', svc],
			['CallExpression:exit', layer]
		]);
		expect(errors).toHaveLength(1);
	});
});
