import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-try-catch.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-try-catch', () => {
	it('flags TryStatement', () => {
		expect(
			Testing.runRule(rule, 'TryStatement', Testing.tryStmt())
		).toHaveLength(1);
	});
});
