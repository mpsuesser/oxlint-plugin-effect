import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/prefer-match-over-switch.ts';
import { Testing } from 'effect-oxlint';

describe('prefer-match-over-switch', () => {
	it('flags SwitchStatement', () => {
		expect(
			Testing.runRule(rule, 'SwitchStatement', Testing.switchStmt())
		).toHaveLength(1);
	});
});
