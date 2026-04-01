import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-command-executor-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-command-executor-service', () => {
	it('flags import of node:child_process', () => {
		const errors = Testing.runRule(
			rule,
			'ImportDeclaration',
			Testing.importDecl('node:child_process')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('CommandExecutor');
	});

	it('flags import of child_process (without node: prefix)', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('child_process')
			)
		).toHaveLength(1);
	});

	it('does not flag unrelated imports', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('@effect/platform')
			)
		).toHaveLength(0);
	});
});
