import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/require-schema-type-alias.ts';
import {
	exportNamedDecl,
	id,
	memberExpr,
	runRuleMulti,
	typeAliasDecl
} from '../utils.ts';

describe('require-schema-type-alias', () => {
	it('flags exported schema const without type alias', () => {
		const exportDecl = exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: id('OrderId'),
					init: memberExpr('Schema', 'String')
				}
			]
		});

		const errors = runRuleMulti(rule, [
			['ExportNamedDeclaration', exportDecl],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain(
			'export type OrderId = typeof OrderId.Type'
		);
	});

	it('does not flag when matching type alias exists', () => {
		const schemaExport = exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: id('OrderId'),
					init: memberExpr('Schema', 'String')
				}
			]
		});
		const typeExport = exportNamedDecl(typeAliasDecl('OrderId'));

		const errors = runRuleMulti(rule, [
			['ExportNamedDeclaration', schemaExport],
			['ExportNamedDeclaration', typeExport],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(0);
	});

	it('does not flag non-schema exports', () => {
		const exportDecl = exportNamedDecl({
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: id('myValue'),
					init: { type: 'Literal', value: 42 }
				}
			]
		});

		const errors = runRuleMulti(rule, [
			['ExportNamedDeclaration', exportDecl],
			['Program:exit' as never, { type: 'Program' }]
		]);
		expect(errors.length).toBe(0);
	});
});
