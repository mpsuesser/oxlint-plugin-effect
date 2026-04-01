import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/stream-large-files.ts';
import { Testing } from 'effect-oxlint';

describe('stream-large-files', () => {
	it('flags fs.readFile', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('fs', 'readFile')
			)
		).toHaveLength(1);
	});
	it('flags fs.readFileString', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('fs', 'readFileString')
			)
		).toHaveLength(1);
	});
	it('allows fs.stream', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('fs', 'stream')
			)
		).toHaveLength(0);
	});
});
