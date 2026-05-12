import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-effect-fn.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-effect-fn', () => {
	// ─────────────────────────────────────────────────────────────────────
	// Context.Service scope
	// ─────────────────────────────────────────────────────────────────────

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

	it('exempts the factory `make:` Effect.gen itself', () => {
		const serviceInner = Testing.callOfMember('Context', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		// factory gen's parent chain: gen -> Property("make") -> ObjectExpr -> serviceOuter
		const objectExpr = {
			type: 'ObjectExpression',
			parent: serviceOuter
		};
		const makeProp = {
			type: 'Property',
			key: { type: 'Identifier', name: 'make' },
			parent: objectExpr
		};
		const factoryGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: makeProp
		};

		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', factoryGen],
			['CallExpression:exit', factoryGen],
			['CallExpression:exit', serviceOuter]
		]);
		expect(errors).toHaveLength(0);
	});

	it('flags a method Effect.gen alongside an exempt factory gen', () => {
		const serviceInner = Testing.callOfMember('Context', 'Service');
		const serviceOuter = {
			type: 'CallExpression',
			callee: serviceInner,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		const objectExpr = {
			type: 'ObjectExpression',
			parent: serviceOuter
		};
		const makeProp = {
			type: 'Property',
			key: { type: 'Identifier', name: 'make' },
			parent: objectExpr
		};
		const factoryGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: makeProp
		};
		// Method gen's parent is anything other than the `make:` property —
		// here a VariableDeclarator standing in for `const x = Effect.gen(...)`
		// inside the factory body.
		const methodGenParent = { type: 'VariableDeclarator' };
		const methodGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: methodGenParent
		};

		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', serviceOuter],
			['CallExpression', factoryGen],
			['CallExpression', methodGen],
			['CallExpression:exit', methodGen],
			['CallExpression:exit', factoryGen],
			['CallExpression:exit', serviceOuter]
		]);
		// methodGen flagged once; factoryGen exempt
		expect(errors).toHaveLength(1);
	});

	// ─────────────────────────────────────────────────────────────────────
	// Layer.* scope
	// ─────────────────────────────────────────────────────────────────────

	it('flags Effect.gen nested inside Layer.effect (not the direct body)', () => {
		const layerCall = Testing.callOfMember('Layer', 'effect');
		// Method gen — parent is something other than the Layer call itself.
		const methodGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: { type: 'VariableDeclarator' }
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layerCall],
			['CallExpression', methodGen],
			['CallExpression:exit', methodGen],
			['CallExpression:exit', layerCall]
		]);
		expect(errors).toHaveLength(1);
	});

	it('exempts the Layer.effect factory body Effect.gen', () => {
		const layerCall = Testing.callOfMember('Layer', 'effect');
		const factoryGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: layerCall
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layerCall],
			['CallExpression', factoryGen],
			['CallExpression:exit', factoryGen],
			['CallExpression:exit', layerCall]
		]);
		expect(errors).toHaveLength(0);
	});

	it('exempts the Layer.scoped factory body Effect.gen', () => {
		const layerCall = Testing.callOfMember('Layer', 'scoped');
		const factoryGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: layerCall
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layerCall],
			['CallExpression', factoryGen],
			['CallExpression:exit', factoryGen],
			['CallExpression:exit', layerCall]
		]);
		expect(errors).toHaveLength(0);
	});

	it('exempts the Layer.succeed factory body Effect.gen', () => {
		const layerCall = Testing.callOfMember('Layer', 'succeed');
		const factoryGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: layerCall
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layerCall],
			['CallExpression', factoryGen],
			['CallExpression:exit', factoryGen],
			['CallExpression:exit', layerCall]
		]);
		expect(errors).toHaveLength(0);
	});

	// ─────────────────────────────────────────────────────────────────────
	// Effect.fn / Effect.fnUntraced wrappers
	// ─────────────────────────────────────────────────────────────────────

	it('allows Effect.gen wrapped by Effect.fn inside a service', () => {
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

	it('allows Effect.gen wrapped by Effect.fnUntraced inside a service', () => {
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

	it('allows Effect.gen wrapped by Effect.fn inside Layer.effect', () => {
		const layerCall = Testing.callOfMember('Layer', 'effect');
		const effectFn = Testing.callOfMember('Effect', 'fn');
		const effectGen = Testing.callOfMember('Effect', 'gen');

		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', layerCall],
			['CallExpression', effectFn],
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen],
			['CallExpression:exit', effectFn],
			['CallExpression:exit', layerCall]
		]);
		expect(errors).toHaveLength(0);
	});

	// ─────────────────────────────────────────────────────────────────────
	// Outside services
	// ─────────────────────────────────────────────────────────────────────

	it('allows Effect.gen with no service context and no named binding', () => {
		const effectGen = Testing.callOfMember('Effect', 'gen');
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});

	it('flags top-level `const x = Effect.gen(...)`', () => {
		const effectGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: { type: 'VariableDeclarator' }
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('flags `export default Effect.gen(...)`', () => {
		const effectGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: { type: 'ExportDefaultDeclaration' }
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(1);
	});

	it('allows Effect.gen used as an expression argument (no name)', () => {
		// Parent is a ReturnStatement — not a named binding, not a service
		// factory, not a flagged top-level assignment.
		const effectGen = {
			...Testing.callOfMember('Effect', 'gen'),
			parent: { type: 'ReturnStatement' }
		};
		const errors = Testing.runRuleMulti(rule, [
			['CallExpression', effectGen],
			['CallExpression:exit', effectGen]
		]);
		expect(errors).toHaveLength(0);
	});
});
