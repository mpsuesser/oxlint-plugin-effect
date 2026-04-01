import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-http-client-service.ts';
import { importDecl, runRule } from '../utils.ts';

describe('use-http-client-service', () => {
	it('flags import of node:http', () => {
		const errors = runRule(
			rule,
			'ImportDeclaration',
			importDecl('node:http')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('HttpClient');
	});

	it('flags import of node:https', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('node:https'))
		).toHaveLength(1);
	});

	it('flags import of http (without node: prefix)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('http'))
		).toHaveLength(1);
	});

	it('flags import of https (without node: prefix)', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('https'))
		).toHaveLength(1);
	});

	it('does not flag unrelated imports', () => {
		expect(
			runRule(rule, 'ImportDeclaration', importDecl('effect'))
		).toHaveLength(0);
	});
});
