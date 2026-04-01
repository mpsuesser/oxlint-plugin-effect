import { describe, expect, it } from 'vitest';

import rule from '../../src/rules/context-tag-extends.ts';
import { callOfMember, classDecl, id, memberExpr, runRule } from '../utils.ts';

describe('context-tag-extends', () => {
	// ── ClassDeclaration: class FooTag extends Context.Tag<...>() ──
	it('flags class FooTag extends Context.Tag()', () => {
		const superClass = callOfMember('Context', 'Tag');
		const node = classDecl('FooTag', superClass);
		expect(runRule(rule, 'ClassDeclaration', node)).toHaveLength(1);
	});

	it('allows class Foo extends ServiceMap.Service()', () => {
		const superClass = callOfMember('ServiceMap', 'Service');
		const node = classDecl('Foo', superClass);
		expect(runRule(rule, 'ClassDeclaration', node)).toHaveLength(0);
	});

	// ── MemberExpression: Context.GenericTag ──
	it('flags Context.GenericTag', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('Context', 'GenericTag')
			)
		).toHaveLength(1);
	});

	// ── MemberExpression: bare Context.Tag (merged from use-servicemap-service) ──
	it('flags bare Context.Tag usage', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Context', 'Tag')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('Context.Tag');
	});

	// ── MemberExpression: bare Effect.Service (merged from use-servicemap-service) ──
	it('flags bare Effect.Service usage', () => {
		const errors = runRule(
			rule,
			'MemberExpression',
			memberExpr('Effect', 'Service')
		);
		expect(errors).toHaveLength(1);
		expect(errors[0]?.message).toContain('Effect.Service');
	});

	// ── CallExpression: class X extends Effect.Service<X>()() ──
	it('flags Effect.Service double-call in class extends position', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: memberExpr('Effect', 'Service'),
				arguments: []
			},
			arguments: [],
			parent: { type: 'ClassDeclaration', id: id('MyService') }
		};
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(1);
	});

	it('does not flag Effect.Service double-call outside class extends', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: memberExpr('Effect', 'Service'),
				arguments: []
			},
			arguments: [],
			parent: { type: 'ExpressionStatement' }
		};
		expect(runRule(rule, 'CallExpression', node)).toHaveLength(0);
	});

	// ── Negative: ServiceMap.Service is fine ──
	it('allows Context.Layer', () => {
		expect(
			runRule(rule, 'MemberExpression', memberExpr('Context', 'Layer'))
		).toHaveLength(0);
	});

	it('does not flag ServiceMap.Service', () => {
		expect(
			runRule(
				rule,
				'MemberExpression',
				memberExpr('ServiceMap', 'Service')
			)
		).toHaveLength(0);
	});
});
