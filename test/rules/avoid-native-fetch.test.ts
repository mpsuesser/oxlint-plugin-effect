import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-native-fetch.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-native-fetch', () => {
	it('flags fetch(url)', () => {
		expect(
			Testing.runRule(rule, 'CallExpression', Testing.callExpr('fetch'))
		).toHaveLength(1);
	});

	it('flags window.fetch(url)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('window', 'fetch')
			)
		).toHaveLength(1);
	});

	it('flags globalThis.fetch(url)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('globalThis', 'fetch')
			)
		).toHaveLength(1);
	});

	it('allows HttpClient.execute()', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('HttpClient', 'execute')
			)
		).toHaveLength(0);
	});

	it('ignores non-fetch identifiers', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callExpr('fetchData')
			)
		).toHaveLength(0);
	});

	// member-expression-callee negative test: self.fetch not caught
	it('does not flag self.fetch (only window/globalThis)', () => {
		expect(
			Testing.runRule(
				rule,
				'CallExpression',
				Testing.callOfMember('self', 'fetch')
			)
		).toHaveLength(0);
	});
});
