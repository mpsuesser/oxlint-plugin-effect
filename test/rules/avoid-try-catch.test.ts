import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-try-catch.ts';
import { runRule, tryStmt } from '../utils.ts';

describe('avoid-try-catch', () => {
	it('flags TryStatement', () => {
		expect(runRule(rule, 'TryStatement', tryStmt())).toHaveLength(1);
	});
});
