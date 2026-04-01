import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-platform-coupling.ts';
import { importDecl, runRule } from '../utils.ts';

describe('avoid-platform-coupling', () => {
	it('flags @effect/platform-bun', () => {
		expect(
			runRule(
				rule,
				'ImportDeclaration',
				importDecl('@effect/platform-bun')
			)
		).toHaveLength(1);
	});
	it('flags @effect/platform-bun/BunHttpClient', () => {
		expect(
			runRule(
				rule,
				'ImportDeclaration',
				importDecl('@effect/platform-bun/BunHttpClient')
			)
		).toHaveLength(1);
	});
	it('allows @effect/platform', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('@effect/platform'))
		).toHaveLength(0);
	});
});
