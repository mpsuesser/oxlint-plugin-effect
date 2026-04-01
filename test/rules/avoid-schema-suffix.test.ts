import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-schema-suffix.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-schema-suffix', () => {
	it('flags const fooSchema = Schema.String()', () => {
		const node = Testing.varDeclarator(
			'fooSchema',
			Testing.callOfMember('Schema', 'String')
		);
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			1
		);
	});

	it('flags const fooSchema = Schema.String (bare MemberExpression)', () => {
		const node = Testing.varDeclarator(
			'fooSchema',
			Testing.memberExpr('Schema', 'String')
		);
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			1
		);
	});

	it('flags const fooSchema = Schema.String.pipe(...) (chained call)', () => {
		const node = Testing.varDeclarator('fooSchema', {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: Testing.memberExpr('Schema', 'String'),
				property: { type: 'Identifier', name: 'pipe' },
				computed: false,
				optional: false
			},
			arguments: []
		});
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			1
		);
	});

	it('allows const Foo = Schema.String()', () => {
		const node = Testing.varDeclarator(
			'Foo',
			Testing.callOfMember('Schema', 'String')
		);
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			0
		);
	});

	it('ignores const Schema = ...', () => {
		const node = Testing.varDeclarator(
			'Schema',
			Testing.callOfMember('Schema', 'String')
		);
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			0
		);
	});

	it('ignores non-Schema init', () => {
		const node = Testing.varDeclarator(
			'fooSchema',
			Testing.callOfMember('Other', 'thing')
		);
		expect(Testing.runRule(rule, 'VariableDeclarator', node)).toHaveLength(
			0
		);
	});
});
