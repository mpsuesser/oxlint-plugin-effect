import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-sync-fs.ts';
import { callExpr, callOfMember, runRule } from '../utils.ts';

describe('avoid-sync-fs', () => {
	it('flags readFileSync()', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('readFileSync'))
		).toHaveLength(1);
	});
	it('flags writeFileSync()', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('writeFileSync'))
		).toHaveLength(1);
	});
	it('flags existsSync()', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('existsSync'))
		).toHaveLength(1);
	});
	it('flags fs.readFileSync()', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('fs', 'readFileSync'))
		).toHaveLength(1);
	});
	it('allows readFile()', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('readFile'))
		).toHaveLength(0);
	});
});
