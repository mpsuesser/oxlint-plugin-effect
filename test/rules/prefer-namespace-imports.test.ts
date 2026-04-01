import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-namespace-imports.ts';
import {
	importDeclWithSpecifiers,
	importNamespaceSpecifier,
	importSpecifier,
	runRule
} from '../utils.ts';

describe('prefer-namespace-imports', () => {
	it('flags named imports from effect submodules', () => {
		const node = importDeclWithSpecifiers('effect/Array', [
			importSpecifier('map')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('import * as Arr');
	});

	it('flags wrong namespace alias for effect/Array', () => {
		const node = importDeclWithSpecifiers('effect/Array', [
			importNamespaceSpecifier('Array')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('canonical alias `Arr`');
	});

	it('allows correct namespace alias', () => {
		const node = importDeclWithSpecifiers('effect/Array', [
			importNamespaceSpecifier('Arr')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('flags named import of Array from root effect barrel', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Array')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain(
			'import * as Arr from "effect/Array"'
		);
	});

	it('allows non-namespace modules from root barrel (Effect, Layer)', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Effect'),
			importSpecifier('Layer')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only import specifiers from barrel', () => {
		const node = importDeclWithSpecifiers('effect', [
			importSpecifier('Schema', undefined, 'type')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('allows namespace imports from non-namespace modules', () => {
		const node = importDeclWithSpecifiers('effect/Effect', [
			importNamespaceSpecifier('Effect')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('flags wrong alias for effect/Predicate', () => {
		const node = importDeclWithSpecifiers('effect/Predicate', [
			importNamespaceSpecifier('Predicate')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.message).toContain('canonical alias `P`');
	});

	it('allows correct alias for effect/Record', () => {
		const node = importDeclWithSpecifiers('effect/Record', [
			importNamespaceSpecifier('R')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('ignores effect/unstable/* imports', () => {
		const node = importDeclWithSpecifiers('effect/unstable/sql', [
			importSpecifier('SqlClient')
		]);
		const errors = runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});
});
