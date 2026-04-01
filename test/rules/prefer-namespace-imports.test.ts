import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-namespace-imports.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-namespace-imports', () => {
	it('flags named imports from effect submodules', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Array', [
			Testing.importSpecifier('map')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('import * as Arr');
	});

	it('flags wrong namespace alias for effect/Array', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Array', [
			Testing.importNamespaceSpecifier('Array')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain(
			'canonical alias `Arr`'
		);
	});

	it('allows correct namespace alias', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Array', [
			Testing.importNamespaceSpecifier('Arr')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('flags named import of Array from root effect barrel', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Array')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain(
			'import * as Arr from "effect/Array"'
		);
	});

	it('allows non-namespace modules from root barrel (Effect, Layer)', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Effect'),
			Testing.importSpecifier('Layer')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('skips type-only import specifiers from barrel', () => {
		const node = Testing.importDeclWithSpecifiers('effect', [
			Testing.importSpecifier('Schema', undefined, 'type')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('allows namespace imports from non-namespace modules', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Effect', [
			Testing.importNamespaceSpecifier('Effect')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('flags wrong alias for effect/Predicate', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Predicate', [
			Testing.importNamespaceSpecifier('Predicate')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(1);
		expect(errors[0]?.diagnostic.message).toContain('canonical alias `P`');
	});

	it('allows correct alias for effect/Record', () => {
		const node = Testing.importDeclWithSpecifiers('effect/Record', [
			Testing.importNamespaceSpecifier('R')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});

	it('ignores effect/unstable/* imports', () => {
		const node = Testing.importDeclWithSpecifiers('effect/unstable/sql', [
			Testing.importSpecifier('SqlClient')
		]);
		const errors = Testing.runRule(rule, 'ImportDeclaration', node);
		expect(errors.length).toBe(0);
	});
});
