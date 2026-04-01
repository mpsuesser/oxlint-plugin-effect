import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/require-schema-type-alias.ts';
import { Testing } from 'effect-oxlint';

describe('require-schema-type-alias', () => {
	it('flags exported schema const without type alias', () => {
		const exportDecl = Testing.exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: Testing.id('OrderId'),
					init: Testing.memberExpr('Schema', 'String')
				}
			]
		});

		const errors = Testing.runRuleMulti(rule, [
			['ExportNamedDeclaration', exportDecl],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain(
			'export type OrderId = typeof OrderId.Type'
		);
	});

	it('does not flag when matching type alias exists', () => {
		const schemaExport = Testing.exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: Testing.id('OrderId'),
					init: Testing.memberExpr('Schema', 'String')
				}
			]
		});
		const typeExport = Testing.exportNamedDecl(
			Testing.typeAliasDecl('OrderId')
		);

		const errors = Testing.runRuleMulti(rule, [
			['ExportNamedDeclaration', schemaExport],
			['ExportNamedDeclaration', typeExport],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(0);
	});

	it('does not flag non-schema exports', () => {
		const exportDecl = Testing.exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: Testing.id('myValue'),
					init: { type: 'Literal', value: 42 }
				}
			]
		});

		const errors = Testing.runRuleMulti(rule, [
			['ExportNamedDeclaration', exportDecl],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(0);
	});
});
