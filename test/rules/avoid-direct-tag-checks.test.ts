import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-direct-tag-checks.ts';
import { binaryExpr, memberExpr, runRule, strLiteral } from '../utils.ts';

describe('avoid-direct-tag-checks', () => {
	it("flags x._tag === 'Foo'", () => {
		const node = binaryExpr(
			'===',
			{ ...memberExpr('x', '_tag'), type: 'MemberExpression' },
			strLiteral('Foo')
		);
		expect(runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("flags x._tag !== 'Foo'", () => {
		const node = binaryExpr(
			'!==',
			{ ...memberExpr('x', '_tag'), type: 'MemberExpression' },
			strLiteral('Foo')
		);
		expect(runRule(rule, 'BinaryExpression', node)).toHaveLength(1);
	});

	it("allows x.type === 'Foo'", () => {
		const node = binaryExpr(
			'===',
			{ ...memberExpr('x', 'type'), type: 'MemberExpression' },
			strLiteral('Foo')
		);
		expect(runRule(rule, 'BinaryExpression', node)).toHaveLength(0);
	});
});
