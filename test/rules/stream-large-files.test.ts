import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/stream-large-files.ts';
import { memberExpr, runRule } from '../utils.ts';

describe('stream-large-files', () => {
	it('flags fs.readFile', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('fs', 'readFile'))
		).toHaveLength(1);
	});
	it('flags fs.readFileString', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('fs', 'readFileString')
			)
		).toHaveLength(1);
	});
	it('allows fs.stream', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('fs', 'stream'))
		).toHaveLength(0);
	});
});
