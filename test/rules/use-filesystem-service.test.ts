import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-filesystem-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-filesystem-service', () => {
	it('flags node:fs', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:fs')
			)
		).toHaveLength(1);
	});
	it('flags fs', () => {
		expect(
			Testing.runRule(rule, 'ImportDeclaration', Testing.importDecl('fs'))
		).toHaveLength(1);
	});
	it('flags node:fs/promises', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:fs/promises')
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
