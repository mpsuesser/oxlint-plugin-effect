import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/vm-in-wrong-file.ts';
import { id, interfaceDecl, runRule } from '../utils.ts';

describe('vm-in-wrong-file', () => {
	it('flags interface FooVM in a .ts file', () => {
		expect(
			runRule(rule, 'TSInterfaceDeclaration', interfaceDecl('FooVM'), {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(1);
	});

	it('allows interface FooVM in a .vm.ts file', () => {
		expect(
			runRule(rule, 'TSInterfaceDeclaration', interfaceDecl('FooVM'), {
				filename: '/app/components/Foo.vm.ts'
			})
		).toHaveLength(0);
	});

	it('allows interface FooProps (not VM) in a .ts file', () => {
		expect(
			runRule(rule, 'TSInterfaceDeclaration', interfaceDecl('FooProps'), {
				filename: '/app/components/Foo.ts'
			})
		).toHaveLength(0);
	});

	it('flags Layer.effect(FooVM, ...) in a .tsx file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: id('Layer'),
				property: id('effect')
			},
			arguments: [id('FooVM')]
		};
		expect(
			runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.tsx'
			})
		).toHaveLength(1);
	});

	it('allows Layer.effect(FooVM, ...) in a .vm.ts file', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: id('Layer'),
				property: id('effect')
			},
			arguments: [id('FooVM')]
		};
		expect(
			runRule(rule, 'CallExpression', node, {
				filename: '/app/components/Foo.vm.ts'
			})
		).toHaveLength(0);
	});
});
