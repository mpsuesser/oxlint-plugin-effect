import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-node-imports.ts';
import { importDecl, runRule } from '../utils.ts';

describe('avoid-node-imports', () => {
	// ── Still flags node:* not covered by specific rules ──
	it('flags node:crypto', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:crypto'))
		).toHaveLength(1);
	});

	it('flags node:stream', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:stream'))
		).toHaveLength(1);
	});

	it('flags node:dns', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:dns'))
		).toHaveLength(1);
	});

	// ── Exclusions: sources covered by specific use-*-service rules ──
	it('does NOT flag node:fs (covered by use-filesystem-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:fs'))
		).toHaveLength(0);
	});

	it('does NOT flag node:fs/promises (covered by use-filesystem-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:fs/promises'))
		).toHaveLength(0);
	});

	it('does NOT flag node:path (covered by use-path-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:path'))
		).toHaveLength(0);
	});

	it('does NOT flag node:os (covered by use-temp-file-scoped)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:os'))
		).toHaveLength(0);
	});

	it('does NOT flag node:child_process (covered by use-command-executor-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:child_process'))
		).toHaveLength(0);
	});

	it('does NOT flag node:http (covered by use-http-client-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:http'))
		).toHaveLength(0);
	});

	it('does NOT flag node:https (covered by use-http-client-service)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:https'))
		).toHaveLength(0);
	});

	// ── Does not flag non-node: imports ──
	it('allows @effect/platform', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('@effect/platform'))
		).toHaveLength(0);
	});

	it('allows effect imports', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('effect'))
		).toHaveLength(0);
	});
});
