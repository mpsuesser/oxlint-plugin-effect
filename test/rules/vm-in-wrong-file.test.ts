import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/vm-in-wrong-file.ts';
import { Testing } from 'effect-oxlint';

describe('vm-in-wrong-file', () => {
	// ─────────────────────────────────────────────────────────────────────
	// Interface declarations
	// ─────────────────────────────────────────────────────────────────────

	it('flags `interface FooVM` in a .ts file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooVM'),
				{ filename: '/app/components/Foo.ts' }
			)
		).toHaveLength(1);
	});

	it('allows `interface FooVM` in a .vm.ts file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooVM'),
				{ filename: '/app/components/Foo.vm.ts' }
			)
		).toHaveLength(0);
	});

	it('allows `interface FooVM` in a .vm.tsx file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooVM'),
				{ filename: '/app/components/Foo.vm.tsx' }
			)
		).toHaveLength(0);
	});

	it('allows `interface FooProps` (not a VM name)', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooProps'),
				{ filename: '/app/components/Foo.ts' }
			)
		).toHaveLength(0);
	});

	// ─────────────────────────────────────────────────────────────────────
	// Layer.effect / Layer.scoped with VM tag
	// ─────────────────────────────────────────────────────────────────────

	it('flags `Layer.effect(FooVM, ...)` in a .tsx file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('effect'),
				computed: false
			},
			arguments: [Testing.id('FooVM')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.tsx'
			})
		).toHaveLength(1);
	});

	it('flags `Layer.scoped(FooVM, ...)` in a .ts file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('scoped'),
				computed: false
			},
			arguments: [Testing.id('FooVM')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(1);
	});

	it('allows `Layer.effect(FooVM, ...)` in a .vm.ts file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('effect'),
				computed: false
			},
			arguments: [Testing.id('FooVM')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.vm.ts'
			})
		).toHaveLength(0);
	});

	it('allows `Layer.effect(SomeLayer, ...)` (not a VM tag)', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('effect'),
				computed: false
			},
			arguments: [Testing.id('SomeLayer')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(0);
	});

	// ─────────────────────────────────────────────────────────────────────
	// Context.Service<FooVM>(...) double-call
	// ─────────────────────────────────────────────────────────────────────

	it('flags `Context.Service<FooVM>()(...)` in a .ts file', () => {
		// `Context.Service<FooVM>` — first call with type argument
		const innerCall = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Context'),
				property: Testing.id('Service'),
				computed: false
			},
			typeArguments: {
				params: [
					{
						type: 'TSTypeReference',
						typeName: Testing.id('FooVM')
					}
				]
			},
			arguments: []
		};
		// Outer call: `innerCall(...)`
		const outerCall = {
			type: 'CallExpression',
			callee: innerCall,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', outerCall, {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(1);
	});

	it('allows `Context.Service<FooVM>()(...)` in a .vm.ts file', () => {
		const innerCall = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Context'),
				property: Testing.id('Service'),
				computed: false
			},
			typeArguments: {
				params: [
					{
						type: 'TSTypeReference',
						typeName: Testing.id('FooVM')
					}
				]
			},
			arguments: []
		};
		const outerCall = {
			type: 'CallExpression',
			callee: innerCall,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', outerCall, {
				filename: '/app/components/Foo.vm.ts'
			})
		).toHaveLength(0);
	});

	it('allows `Context.Service<FooService>()(...)` (not a VM name)', () => {
		const innerCall = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Context'),
				property: Testing.id('Service'),
				computed: false
			},
			typeArguments: {
				params: [
					{
						type: 'TSTypeReference',
						typeName: Testing.id('FooService')
					}
				]
			},
			arguments: []
		};
		const outerCall = {
			type: 'CallExpression',
			callee: innerCall,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', outerCall, {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(0);
	});

	it('allows `Context.Service` with no type arguments', () => {
		const innerCall = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Context'),
				property: Testing.id('Service'),
				computed: false
			},
			arguments: []
		};
		const outerCall = {
			type: 'CallExpression',
			callee: innerCall,
			arguments: [{ type: 'Literal', value: '@app/Foo' }]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', outerCall, {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(0);
	});
});
