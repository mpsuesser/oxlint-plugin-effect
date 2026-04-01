import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-temp-file-scoped.ts';
import { importDecl, memberExpr, runRule } from '../utils.ts';

describe('use-temp-file-scoped', () => {
	it('flags import os', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('os'))
		).toHaveLength(1);
	});
	it('flags import node:os', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:os'))
		).toHaveLength(1);
	});
	it('flags os.tmpdir', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('os', 'tmpdir'))
		).toHaveLength(1);
	});
	it('allows @effect/platform', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('@effect/platform'))
		).toHaveLength(0);
	});
});
