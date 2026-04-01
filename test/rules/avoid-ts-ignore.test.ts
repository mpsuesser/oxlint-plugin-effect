import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/avoid-ts-ignore.ts';
import { Testing } from 'effect-oxlint';

describe('avoid-ts-ignore', () => {
	it('flags @ts-ignore comment', () => {
		const errors = Testing.runRule(rule, 'Program', Testing.program(), {
			comments: [Testing.comment('Line', ' @ts-ignore')]
		});
		expect(errors).toHaveLength(1);
	});
	it('flags @ts-expect-error comment', () => {
		const errors = Testing.runRule(rule, 'Program', Testing.program(), {
			comments: [Testing.comment('Line', ' @ts-expect-error')]
		});
		expect(errors).toHaveLength(1);
	});
	it('allows normal comments', () => {
		const errors = Testing.runRule(rule, 'Program', Testing.program(), {
			comments: [Testing.comment('Line', ' This is fine')]
		});
		expect(errors).toHaveLength(0);
	});
});
