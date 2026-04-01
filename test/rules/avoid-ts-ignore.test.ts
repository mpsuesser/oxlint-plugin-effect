import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-ts-ignore.ts';
import { program, runRule } from '../utils.ts';

describe('avoid-ts-ignore', () => {
	it('flags @ts-ignore comment', () => {
		const errors = runRule(rule, 'Program', program(), {
			comments: [
				{ type: 'Line', value: ' @ts-ignore', start: 0, end: 14 }
			]
		});
		expect(errors).toHaveLength(1);
	});
	it('flags @ts-expect-error comment', () => {
		const errors = runRule(rule, 'Program', program(), {
			comments: [
				{ type: 'Line', value: ' @ts-expect-error', start: 0, end: 20 }
			]
		});
		expect(errors).toHaveLength(1);
	});
	it('allows normal comments', () => {
		const errors = runRule(rule, 'Program', program(), {
			comments: [
				{ type: 'Line', value: ' This is fine', start: 0, end: 16 }
			]
		});
		expect(errors).toHaveLength(0);
	});
});
