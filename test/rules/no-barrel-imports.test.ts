import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/no-barrel-imports.ts';
import { Testing } from 'effect-oxlint';

describe('no-barrel-imports', () => {
	it('flags named imports from "effect" barrel', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Effect')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain(
			'import * as Effect from "effect/Effect"'
		);
	});

	it('allows namespace imports from "effect"', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importNamespaceSpecifier('Eff')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only import declarations', () => {
		const node = Testing.importDeclWithSpecifiers(
			'effect',
			[Testing.importSpecifier('Effect')],
			'type'
		);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only specifiers', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Effect', undefined, 'type')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag imports from non-barrel packages', () => {
		const node = Testing.importDeclWithSpecifiers('lodash', [
			Testing.importSpecifier('map')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('reports once per declaration (not per specifier)', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Effect'),
			Testing.importSpecifier('Layer'),
			Testing.importSpecifier('pipe')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
	});
});
