import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/use-filesystem-service.ts';
import { importDecl, runRule } from '../utils.ts';

describe('use-filesystem-service', () => {
	it('flags node:fs', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:fs'))
		).toHaveLength(1);
	});
	it('flags fs', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('fs'))
		).toHaveLength(1);
	});
	it('flags node:fs/promises', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:fs/promises'))
		).toHaveLength(1);
	});
	it('allows @effect/platform', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('@effect/platform'))
		).toHaveLength(0);
	});
});
