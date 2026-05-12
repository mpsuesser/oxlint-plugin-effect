import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-platform-coupling.ts';
import { Testing } from 'effect-oxlint';

const BINDING = '/repo/packages/sdk/binding/index.ts';
const RUNTIME = '/repo/packages/sdk/runtime/main.ts';
const APP = '/repo/apps/server/main.ts';

describe('avoid-platform-coupling', () => {
	it('flags @effect/platform-bun inside a binding package', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun'),
				{ filename: BINDING }
			)
		).toHaveLength(1);
	});

	it('flags @effect/platform-bun/BunHttpClient inside a binding package', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun/BunHttpClient'),
				{ filename: BINDING }
			)
		).toHaveLength(1);
	});

	it('allows @effect/platform inside a binding package', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform'),
				{ filename: BINDING }
			)
		).toHaveLength(0);
	});

	it('allows @effect/platform-bun outside a binding package (runtime sibling)', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun'),
				{ filename: RUNTIME }
			)
		).toHaveLength(0);
	});

	it('allows @effect/platform-bun outside a binding package (app entrypoint)', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun'),
				{ filename: APP }
			)
		).toHaveLength(0);
	});

	it('allows @effect/platform-bun in a default test file (no binding path)', () => {
		// Default mock filename is /test/file.ts — outside any binding package.
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform-bun')
			)
		).toHaveLength(0);
	});
});
