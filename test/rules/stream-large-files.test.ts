import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/stream-large-files.ts';
import { Testing } from 'effect-oxlint';

const readFile = (...args: ReadonlyArray<unknown>) =>
	Testing.callOfMember('fs', 'readFile', args);
const readFileString = (...args: ReadonlyArray<unknown>) =>
	Testing.callOfMember('fs', 'readFileString', args);

const flag = (n: unknown) => Testing.runRule(rule, 'CallExpression', n);

describe('stream-large-files', () => {
	// ── Positive: large-name literal ──
	it('flags a string literal naming an export', () => {
		expect(
			flag(readFile(Testing.strLiteral('users.export.log')))
		).toHaveLength(1);
	});
	it('flags a string literal naming a CSV', () => {
		expect(flag(readFile(Testing.strLiteral('orders.csv')))).toHaveLength(
			1
		);
	});
	it('flags a string literal naming an NDJSON dump', () => {
		expect(
			flag(readFile(Testing.strLiteral('events.ndjson')))
		).toHaveLength(1);
	});
	it('flags a string literal naming a backup', () => {
		expect(
			flag(readFile(Testing.strLiteral('snapshots/backup-2024.tar')))
		).toHaveLength(1);
	});

	// ── Positive: computed path ──
	it('flags path.join(...)', () => {
		expect(
			flag(
				readFile(
					Testing.callOfMember('path', 'join', [
						Testing.strLiteral('a'),
						Testing.strLiteral('b')
					])
				)
			)
		).toHaveLength(1);
	});
	it('flags path.resolve(...)', () => {
		expect(
			flag(
				readFile(
					Testing.callOfMember('path', 'resolve', [
						Testing.strLiteral('a')
					])
				)
			)
		).toHaveLength(1);
	});

	// ── Positive: indexed / property access ──
	it('flags an indexed access `files[i]`', () => {
		expect(
			flag(readFile(Testing.computedMemberExpr('files', 'i')))
		).toHaveLength(1);
	});
	it('flags a `.path` property access `item.path`', () => {
		expect(flag(readFile(Testing.memberExpr('item', 'path')))).toHaveLength(
			1
		);
	});

	// ── Positive: string concatenation ──
	it('flags `dir + file` concatenation', () => {
		expect(
			flag(
				readFile(
					Testing.binaryExpr(
						'+',
						Testing.id('dir'),
						Testing.id('file')
					)
				)
			)
		).toHaveLength(1);
	});

	// ── Negative: ordinary literals ──
	it('does not flag a small named config literal', () => {
		expect(flag(readFile(Testing.strLiteral('config.json')))).toHaveLength(
			0
		);
	});
	it('does not flag a bare identifier path', () => {
		expect(flag(readFile(Testing.id('myPath')))).toHaveLength(0);
	});
	it('does not flag a non-builder `path.*` call (e.g. path.basename)', () => {
		expect(
			flag(
				readFile(
					Testing.callOfMember('path', 'basename', [Testing.id('p')])
				)
			)
		).toHaveLength(0);
	});
	it('does not flag a non-`.path` property access', () => {
		expect(
			flag(readFile(Testing.memberExpr('item', 'config')))
		).toHaveLength(0);
	});
	it('does not flag a non-`+` binary expression', () => {
		expect(
			flag(
				readFile(
					Testing.binaryExpr('===', Testing.id('a'), Testing.id('b'))
				)
			)
		).toHaveLength(0);
	});

	// ── Coverage of fs.readFileString ──
	it('flags readFileString with a large-name literal', () => {
		expect(
			flag(readFileString(Testing.strLiteral('events.jsonl')))
		).toHaveLength(1);
	});

	// ── Other fs methods are untouched ──
	it('does not flag fs.writeFile', () => {
		expect(
			flag(
				Testing.callOfMember('fs', 'writeFile', [
					Testing.strLiteral('export.log')
				])
			)
		).toHaveLength(0);
	});

	// ── No argument ──
	it('does not flag fs.readFile() with no arguments', () => {
		expect(flag(readFile())).toHaveLength(0);
	});
});
