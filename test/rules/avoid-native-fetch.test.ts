import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-native-fetch.ts';
import { callExpr, callOfMember, runRule } from '../utils.ts';

describe('avoid-native-fetch', () => {
	it('flags fetch(url)', () => {
		expect(runRule(rule, 'CallExpression', callExpr('fetch'))).toHaveLength(
			1
		);
	});

	it('flags window.fetch(url)', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('window', 'fetch'))
		).toHaveLength(1);
	});

	it('flags globalThis.fetch(url)', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('globalThis', 'fetch'))
		).toHaveLength(1);
	});

	it('allows HttpClient.execute()', () => {
		expect(
			runRule(
				rule,
				'CallExpression',
				callOfMember('HttpClient', 'execute')
			)
		).toHaveLength(0);
	});

	it('ignores non-fetch identifiers', () => {
		expect(
			runRule(rule, 'CallExpression', callExpr('fetchData'))
		).toHaveLength(0);
	});

	// member-expression-callee negative test: self.fetch not caught
	it('does not flag self.fetch (only window/globalThis)', () => {
		expect(
			runRule(rule, 'CallExpression', callOfMember('self', 'fetch'))
		).toHaveLength(0);
	});
});
