import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/no-opaque-instance-fields.ts';
import {
	classDeclWithBody,
	id,
	importDeclWithSpecifiers,
	importNamespaceSpecifier,
	methodDef,
	propertyDef,
	runRuleMulti
} from '../utils.ts';

describe('no-opaque-instance-fields', () => {
	const schemaImport = importDeclWithSpecifiers('effect/Schema', [
		importNamespaceSpecifier('Schema')
	]);

	// Schema.Opaque("Tag")({ value: Schema.String })
	// Represented as: CallExpression(callee=CallExpression(callee=Schema.Opaque))
	const opaqueSuper = {
		type: 'CallExpression',
		callee: {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: id('Schema'),
				property: id('Opaque'),
				computed: false,
				optional: false
			},
			arguments: [{ type: 'Literal', value: 'MyOpaque' }]
		},
		arguments: [{ type: 'ObjectExpression', properties: [] }]
	};

	it('flags instance properties on Schema.Opaque class', () => {
		const node = classDeclWithBody('MyOpaque', opaqueSuper, [
			propertyDef('value')
		]);
		const errors = runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('instance properties');
		expect(errors[0]?.message).toContain('`value`');
	});

	it('flags instance methods on Schema.Opaque class', () => {
		const node = classDeclWithBody('MyOpaque', opaqueSuper, [
			methodDef('getValue')
		]);
		const errors = runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('instance methods');
	});

	it('allows static members on Schema.Opaque class', () => {
		const node = classDeclWithBody('MyOpaque', opaqueSuper, [
			propertyDef('defaultValue', true),
			methodDef('create', true)
		]);
		const errors = runRuleMulti(rule, [
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
					object: id('Schema'),
					property: id('Class'),
					computed: false,
					optional: false
				},
				arguments: [{ type: 'Literal', value: 'MyClass' }]
			},
			arguments: [{ type: 'ObjectExpression', properties: [] }]
		};
		const node = classDeclWithBody('MyClass', classSuper, [
			propertyDef('value')
		]);
		const errors = runRuleMulti(rule, [
			['ImportDeclaration', schemaImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(0);
	});

	it('does not flag when Schema import is not from effect', () => {
		const otherImport = importDeclWithSpecifiers('my-lib', [
			importNamespaceSpecifier('Schema')
		]);
		const node = classDeclWithBody('MyOpaque', opaqueSuper, [
			propertyDef('value')
		]);
		const errors = runRuleMulti(rule, [
			['ImportDeclaration', otherImport],
			['ClassDeclaration', node]
		]);
		expect(errors.length).toBe(0);
	});
});
