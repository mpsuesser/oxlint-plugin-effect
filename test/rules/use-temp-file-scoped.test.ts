import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-temp-file-scoped.ts';
import { Testing } from 'effect-oxlint';

describe('use-temp-file-scoped', () => {
	it('flags import os', () => {
		expect(
			Testing.runRule(rule, 'ImportDeclaration', Testing.importDecl('os'))
		).toHaveLength(1);
	});
	it('flags import node:os', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:os')
			)
		).toHaveLength(1);
	});
	it('flags os.tmpdir', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('os', 'tmpdir')
			)
		).toHaveLength(1);
	});
	it('allows @effect/platform', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform')
			)
		).toHaveLength(0);
	});
});
