import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-direct-tag-checks.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-direct-tag-checks', () => {
	// ── BinaryExpression: equality on `_tag` ──
	it("flags x._tag === 'Foo'", () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.memberExpr('x', '_tag'),
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("flags x._tag !== 'Foo'", () => {
		const node = Testing.binaryExpr(
			'!==',
			Testing.memberExpr('x', '_tag'),
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("flags reversed: 'Foo' === x._tag", () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.strLiteral('Foo'),
			Testing.memberExpr('x', '_tag')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it('flags template-literal tag value: x._tag === `Foo`', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.memberExpr('x', '_tag'),
			{ type: 'TemplateLiteral' }
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("allows x.type === 'Foo' (different property)", () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.memberExpr('x', 'type'),
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(0);
	});

	it('allows `x._tag === otherVar` (rhs not literal)', () => {
		const node = Testing.binaryExpr(
			'===',
			Testing.memberExpr('x', '_tag'),
			Testing.id('otherVar')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(0);
	});

	it('allows `==` (loose equality, not strict tag check)', () => {
		const node = Testing.binaryExpr(
			'==',
			Testing.memberExpr('x', '_tag'),
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(0);
	});

	// ── SwitchStatement: switch on `_tag` ──
	it('flags switch (x._tag)', () => {
		const node = {
			type: 'SwitchStatement',
			discriminant: Testing.memberExpr('x', '_tag'),
			cases: []
		};
		expect(Testing.runRule(rule, 'SwitchStatement', node)).toHaveLength(1);
	});

	it('allows switch (x.kind) (different property)', () => {
		const node = {
			type: 'SwitchStatement',
			discriminant: Testing.memberExpr('x', 'kind'),
			cases: []
		};
		expect(Testing.runRule(rule, 'SwitchStatement', node)).toHaveLength(0);
	});

	it('allows switch (value) (bare identifier discriminant)', () => {
		const node = {
			type: 'SwitchStatement',
			discriminant: Testing.id('value'),
			cases: []
		};
		expect(Testing.runRule(rule, 'SwitchStatement', node)).toHaveLength(0);
	});
});
