import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/context-tag-extends.ts';
import { Testing } from 'effect-oxlint';

describe('context-tag-extends', () => {
	// ── ClassDeclaration: class FooTag extends Context.Tag<...>() ──
	it('flags class FooTag extends Context.Tag()', () => {
		const superClass = Testing.callOfMember('Context', 'Tag');
		const node = Testing.classDecl('FooTag', { superClass });
		expect(Testing.runRule(rule, 'ClassDeclaration', node)).toHaveLength(1);
	});

	it('allows class Foo extends ServiceMap.Service()', () => {
		const superClass = Testing.callOfMember('ServiceMap', 'Service');
		const node = Testing.classDecl('Foo', { superClass });
		expect(Testing.runRule(rule, 'ClassDeclaration', node)).toHaveLength(0);
	});

	// ── MemberExpression: Context.GenericTag ──
	it('flags Context.GenericTag', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Context', 'GenericTag')
			)
		).toHaveLength(1);
	});

	// ── MemberExpression: bare Context.Tag (merged from use-servicemap-service) ──
	it('flags bare Context.Tag usage', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Context', 'Tag')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('Context.Tag');
	});

	// ── MemberExpression: bare Effect.Service (merged from use-servicemap-service) ──
	it('flags bare Effect.Service usage', () => {
		const errors = Testing.runRule(
			rule,
			'MemberExpression',
			Testing.memberExpr('Effect', 'Service')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.diagnostic.message).toContain('Effect.Service');
	});

	// ── CallExpression: class X extends Effect.Service<X>()() ──
	it('flags Effect.Service double-call in class extends position', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: Testing.memberExpr('Effect', 'Service'),
				arguments: []
			},
			arguments: [],
			parent: { type: 'ClassDeclaration', id: Testing.id('MyService') }
		};
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('does not flag Effect.Service double-call outside class extends', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: Testing.memberExpr('Effect', 'Service'),
				arguments: []
			},
			arguments: [],
			parent: { type: 'ExpressionStatement' }
		};
		expect(Testing.runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	// ── Negative: ServiceMap.Service is fine ──
	it('allows Context.Layer', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('Context', 'Layer')
			)
		).toHaveLength(0);
	});

	it('does not flag ServiceMap.Service', () => {
		expect(
			Testing.runRule(
				rule,
				'MemberExpression',
				Testing.memberExpr('ServiceMap', 'Service')
			)
		).toHaveLength(0);
	});
});
