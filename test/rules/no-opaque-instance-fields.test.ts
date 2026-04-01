import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/no-opaque-instance-fields.ts';
import { Testing } from 'effect-oxlint';

describe('no-opaque-instance-fields', () => {
	const schemaImport = Testing.importDeclWithSpecifiers('effect/Schema', [
		Testing.importNamespaceSpecifier('Schema')
	]);

	// Schema.Opaque("Tag")({ value: Schema.String })
	// Represented as: CallExpression(callee=CallExpression(callee=Schema.Opaque))
	const opaqueSuper = {
		type: 'CallExpression',
		callee: {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.id('Schema'),
				property: Testing.id('Opaque'),
				computed: false,
				optional: false
			},
			arguments: [{ type: 'Literal', value: 'MyOpaque' }]
		},
		arguments: [{ type: 'ObjectExpression', properties: [] }]
	};

	it('flags instance properties on Schema.Opaque class', () => {
		const node = Testing.classDecl('MyOpaque', {
			superClass: opaqueSuper,
			members: [Testing.propertyDef('value')]
		});
		const errors = Testing.runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('instance properties');
		expect(errors[0]?.diagnostic.message).toContain('`value`');
	});

	it('flags instance methods on Schema.Opaque class', () => {
		const node = Testing.classDecl('MyOpaque', {
			superClass: opaqueSuper,
			members: [Testing.methodDef('getValue')]
		});
		const errors = Testing.runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('instance methods');
	});

	it('allows static members on Schema.Opaque class', () => {
		const node = Testing.classDecl('MyOpaque', {
			superClass: opaqueSuper,
			members: [
				Testing.propertyDef('defaultValue', true),
				Testing.methodDef('create', true)
			]
		});
		const errors = Testing.runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(0);
	});

	it('does not flag non-Opaque classes', () => {
		const classSuper = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					object: Testing.id('Schema'),
					property: Testing.id('Class'),
					computed: false,
					optional: false
				},
				arguments: [{ type: 'Literal', value: 'MyClass' }]
			},
			arguments: [{ type: 'ObjectExpression', properties: [] }]
		};
		const node = Testing.classDecl('MyClass', {
			superClass: classSuper,
			members: [Testing.propertyDef('value')]
		});
		const errors = Testing.runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(0);
	});

	it('does not flag when Schema import is not from effect', () => {
		const otherImport = Testing.importDeclWithSpecifiers('my-lib', [
			Testing.importNamespaceSpecifier('Schema')
		]);
		const node = Testing.classDecl('MyOpaque', {
			superClass: opaqueSuper,
			members: [Testing.propertyDef('value')]
		});
		const errors = Testing.runRuleMulti(rule, [
			['ImportDeclaration', otherImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(0);
	});
});
