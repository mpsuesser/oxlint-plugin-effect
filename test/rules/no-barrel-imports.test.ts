import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/no-barrel-imports.ts';
import {
	importDeclWithSpecifiers,
	importNamespaceSpecifier,
	importSpecifier,
	runRule
} from '../utils.ts';

describe('no-barrel-imports', () => {
	it('flags named imports from "effect" barrel', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Effect')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain(
			'import * as Effect from "effect/Effect"'
		);
	});

	it('allows namespace imports from "effect"', () => {
		const node = importDeclWithSpecifiers('effect', [
			importNamespaceSpecifier('Eff')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only import declarations', () => {
		const node = importDeclWithSpecifiers(
			'effect',
			[importSpecifier('Effect')],
			'type'
		);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only specifiers', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Effect', undefined, 'type')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('does not flag imports from non-barrel packages', () => {
		const node = importDeclWithSpecifiers('lodash', [
			importSpecifier('map')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('reports once per declaration (not per specifier)', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Effect'),
			importSpecifier('Layer'),
			importSpecifier('pipe')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
	});
});
