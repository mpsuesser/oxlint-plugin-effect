import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/imperative-loops.ts';
import { forInStmt, forOfStmt, forStmt, runRule } from '../utils.ts';

describe('imperative-loops', () => {
	it('flags ForStatement', () => {
		expect(runRule(rule, 'ForStatement', forStmt())).toHaveLength(1);
	});
	it('flags ForInStatement', () => {
		expect(runRule(rule, 'ForInStatement', forInStmt())).toHaveLength(1);
	});
	it('flags ForOfStatement', () => {
		expect(runRule(rule, 'ForOfStatement', forOfStmt())).toHaveLength(1);
	});
});
