import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-sync-fs.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-sync-fs', () => {
	it('flags readFileSync()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('readFileSync')
			)
		).toHaveLength(1);
	});
	it('flags writeFileSync()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('writeFileSync')
			)
		).toHaveLength(1);
	});
	it('flags existsSync()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('existsSync')
			)
		).toHaveLength(1);
	});
	it('flags fs.readFileSync()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('fs', 'readFileSync')
			)
		).toHaveLength(1);
	});
	it('allows readFile()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('readFile')
			)
		).toHaveLength(0);
	});
});
