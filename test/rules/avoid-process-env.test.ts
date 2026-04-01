import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-process-env.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('avoid-process-env', () => {
	it('flags process.env', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('process', 'env'))
		).toHaveLength(1);
	});
	it('allows Config.string', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Config', 'string'))
		).toHaveLength(0);
	});
});
