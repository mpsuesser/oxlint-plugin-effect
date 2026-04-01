import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/use-command-executor-service.ts';
import { importDecl, runRule } from '../utils.ts';

describe('use-command-executor-service', () => {
	it('flags import of node:child_process', () => {
		const errors = runRule(
			rule,
			'ImportDeclaration',
			importDecl('node:child_process')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('CommandExecutor');
	});

	it('flags import of child_process (without node: prefix)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('child_process'))
		).toHaveLength(1);
	});

	it('does not flag unrelated imports', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('@effect/platform'))
		).toHaveLength(0);
	});
});
