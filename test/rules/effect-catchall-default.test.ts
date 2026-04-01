import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/effect-catchall-default.ts';
import {
	arrowFn,
	blockStmt,
	callOfMember,
	returnStmt,
	runRule
} from '../utils.ts';

describe('effect-catchall-default', () => {
	it('flags Effect.catchAll(() => Effect.succeed(default))', () => {
		const handler = arrowFn(
			callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = callOfMember('Effect', 'catchAll', [handler]);
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags Effect.catchAll(() => { return Effect.sync(...) })', () => {
		const body = blockStmt([
			returnStmt(
				callOfMember('Effect', 'sync', [
					{ type: 'Literal', value: 'default' }
				])
			)
		]);
		const handler = arrowFn(body);
		const node = callOfMember('Effect', 'catchAll', [handler]);
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('flags Effect.catchAllCause(() => Effect.succeed(default))', () => {
		const handler = arrowFn(
			callOfMember('Effect', 'succeed', [
				{ type: 'Literal', value: 'default' }
			])
		);
		const node = callOfMember('Effect', 'catchAllCause', [handler]);
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('allows Effect.catchTag()', () => {
		const node = callOfMember('Effect', 'catchTag');
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	it('allows Effect.catchAll with non-succeed handler', () => {
		const handler = arrowFn(
			callOfMember('Effect', 'fail', [{ type: 'Literal', value: 'err' }])
		);
		const node = callOfMember('Effect', 'catchAll', [handler]);
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});
});
