import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/vm-in-wrong-file.ts';
import { Testing } from 'effect-oxlint';

describe('vm-in-wrong-file', () => {
	it('flags interface FooVM in a .ts file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooVM'),
				{
					filename: '/app/components/Foo.ts'
				}
			)
		).toHaveLength(1);
	});

	it('allows interface FooVM in a .vm.ts file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooVM'),
				{
					filename: '/app/components/Foo.vm.ts'
				}
			)
		).toHaveLength(0);
	});

	it('allows interface FooProps (not VM) in a .ts file', () => {
		expect(
			Testing.runRule(
				rule,
				'TSInterfaceDeclaration',
				Testing.interfaceDecl('FooProps'),
				{
					filename: '/app/components/Foo.ts'
				}
			)
		).toHaveLength(0);
	});

	it('flags Layer.effect(FooVM, ...) in a .tsx file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('effect')
			},
			arguments: [Testing.id('FooVM')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.tsx'
			})
		).toHaveLength(1);
	});

	it('allows Layer.effect(FooVM, ...) in a .vm.ts file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Layer'),
				property: Testing.id('effect')
			},
			arguments: [Testing.id('FooVM')]
		};
		expect(
			Testing.runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.vm.ts'
			})
		).toHaveLength(0);
	});
});
