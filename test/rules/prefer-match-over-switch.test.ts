import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/prefer-match-over-switch.ts';
import { runRule, switchStmt } from '../utils.ts';

describe('prefer-match-over-switch', () => {
	it('flags SwitchStatement', () => {
		expect(runRule(rule, 'SwitchStatement', switchStmt())).toHaveLength(1);
	});
});
