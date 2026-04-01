import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-direct-tag-checks.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-direct-tag-checks', () => {
	it("flags x._tag === 'Foo'", () => {
		const node = Testing.binaryExpr(
			'===',
			{ ...Testing.memberExpr('x', '_tag'), type: 'MemberExpression' },
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("flags x._tag !== 'Foo'", () => {
		const node = Testing.binaryExpr(
			'!==',
			{ ...Testing.memberExpr('x', '_tag'), type: 'MemberExpression' },
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("allows x.type === 'Foo'", () => {
		const node = Testing.binaryExpr(
			'===',
			{ ...Testing.memberExpr('x', 'type'), type: 'MemberExpression' },
			Testing.strLiteral('Foo')
		);
		expect(Testing.runRule(rule, 'BinaryExpression', node)).toHaveLength(0);
	});
});
