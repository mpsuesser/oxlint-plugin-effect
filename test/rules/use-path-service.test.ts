import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-path-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-path-service', () => {
	it('flags node:path', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:path')
			)
		).toHaveLength(1);
	});
	it('flags path', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('path')
			)
		).toHaveLength(1);
	});
	it('allows effect/Path', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('effect/Path')
			)
		).toHaveLength(0);
	});
});
