import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/use-http-client-service.ts';
import { Testing } from 'effect-oxlint';

describe('use-http-client-service', () => {
	it('flags import of node:http', () => {
		const errors = Testing.runRule(
			rule,
			'ImportDeclaration',
			Testing.importDecl('node:http')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('HttpClient');
	});

	it('flags import of node:https', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('node:https')
			)
		).toHaveLength(1);
	});

	it('flags import of http (without node: prefix)', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('http')
			)
		).toHaveLength(1);
	});

	it('flags import of https (without node: prefix)', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('https')
			)
		).toHaveLength(1);
	});

	it('does not flag unrelated imports', () => {
		expect(
			Testing.runRule(
				rule,
				'ImportDeclaration',
				Testing.importDecl('effect')
			)
		).toHaveLength(0);
	});
});
