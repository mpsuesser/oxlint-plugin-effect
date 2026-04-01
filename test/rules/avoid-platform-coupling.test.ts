import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-platform-coupling.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-platform-coupling', () => {
	it('flags @effect/platform-bun', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun')
			)
		).toHaveLength(1);
	});
	it('flags @effect/platform-bun/BunHttpClient', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun/BunHttpClient')
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
