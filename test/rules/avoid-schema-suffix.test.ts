import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-schema-suffix.ts';
import { callOfMember, memberExpr, runRule, varDeclarator } from '../utils.ts';

describe('avoid-schema-suffix', () => {
	it('flags const fooSchema = Schema.String()', () => {
		const node = varDeclarator(
			'fooSchema',
			callOfMember('Schema', 'String')
		);
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(1);
	});

	it('flags const fooSchema = Schema.String (bare MemberExpression)', () => {
		const node = varDeclarator('fooSchema', memberExpr('Schema', 'String'));
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(1);
	});

	it('flags const fooSchema = Schema.String.pipe(...) (chained call)', () => {
		const node = varDeclarator('fooSchema', {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: memberExpr('Schema', 'String'),
				property: { type: 'Identifier', name: 'pipe' },
				computed: false,
				optional: false
			},
			arguments: []
		});
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(1);
	});

	it('allows const Foo = Schema.String()', () => {
		const node = varDeclarator('Foo', callOfMember('Schema', 'String'));
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(0);
	});

	it('ignores const Schema = ...', () => {
		const node = varDeclarator('Schema', callOfMember('Schema', 'String'));
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(0);
	});

	it('ignores non-Schema init', () => {
		const node = varDeclarator('fooSchema', callOfMember('Other', 'thing'));
		expect(runRule(rule, 'VariableDeclarator', node)).toHaveLength(0);
	});
});
