import { describe, expect, it } from 'vite-plus/test';

import rule from '../../src/rules/avoid-mutable-state.ts';
import { runRule, varDecl } from '../utils.ts';

describe('avoid-mutable-state', () => {
	it('flags let declarations', () => {
		expect(
			runRule(rule, 'VariableDeclaration', varDecl('let', 'x'))
		).toHaveLength(1);
	});
	it('allows const declarations', () => {
		expect(
			runRule(rule, 'VariableDeclaration', varDecl('const', 'x'))
		).toHaveLength(0);
	});
});
