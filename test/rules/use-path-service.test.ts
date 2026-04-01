import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/use-path-service.ts';
import { importDecl, runRule } from '../utils.ts';

describe('use-path-service', () => {
	it('flags node:path', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:path'))
		).toHaveLength(1);
	});
	it('flags path', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('path'))
		).toHaveLength(1);
	});
	it('allows effect/Path', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('effect/Path'))
		).toHaveLength(0);
	});
});
