import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-catchall-default.ts';
import { Testing } from 'effect-oxlint';

describe('effect-catchall-default', () => {
	it('flags Effect.catchAll(() => Effect.succeed(default))', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags Effect.catchAll(() => { return Effect.sync(...) })', () => {
		const body = Testing.blockStmt([
			Testing.returnStmt(
				Testing.callOfMember('Effect', 'sync', [
					{ type: 'Literal', value: 'default' }
				])
			)
		]);
		const handler = Testing.arrowFn(body);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags Effect.catchAllCause(() => Effect.succeed(default))', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAllCause', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('allows Effect.catchTag()', () => {
		const node = Testing.callOfMember('Effect', 'catchTag');
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows Effect.catchAll with non-succeed handler', () => {
		const handler = Testing.arrowFn(
			Testing.callOfMember('Effect', 'fail', [
				{ type: 'Literal', value: 'err' }
			])
		);
		const node = Testing.callOfMember('Effect', 'catchAll', [handler]);
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});
});
