import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-temp-file-scoped.ts';
import { Testing } from 'effect-oxlint';

describe('use-temp-file-scoped', () => {
	// ── Import bans ──
	it('flags `import "os"`', () => {
		expect(
			Testing.runRule(rule, 'ImportDeclaration', Testing.importDecl('os'))
		).toHaveLength(1);
	});

	it('flags `import "node:os"`', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:os')
			)
		).toHaveLength(1);
	});

	it('allows `import "@effect/platform"`', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform')
			)
		).toHaveLength(0);
	});

	// ── os.tmpdir member access ──
	it('flags `os.tmpdir`', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('os', 'tmpdir')
			)
		).toHaveLength(1);
	});

	it('allows `os.platform` (different property)', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('os', 'platform')
			)
		).toHaveLength(0);
	});

	// ── Unscoped makeTempFile / makeTempDirectory ──
	it('flags `fs.makeTempFile(...)`', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'makeTempFile')
			)
		).toHaveLength(1);
	});

	it('flags `fs.makeTempDirectory(...)`', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'makeTempDirectory')
			)
		).toHaveLength(1);
	});

	it('flags `FileSystem.makeTempFile(...)` (different receiver)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('FileSystem', 'makeTempFile')
			)
		).toHaveLength(1);
	});

	it('allows `fs.makeTempFileScoped(...)` (scoped variant)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'makeTempFileScoped')
			)
		).toHaveLength(0);
	});

	it('allows `fs.makeTempDirectoryScoped(...)` (scoped variant)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'makeTempDirectoryScoped')
			)
		).toHaveLength(0);
	});

	it('allows unrelated `fs.readFile(...)` call', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'readFile')
			)
		).toHaveLength(0);
	});

	it('allows bare `makeTempFile(...)` (no receiver)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('makeTempFile')
			)
		).toHaveLength(0);
	});
});
