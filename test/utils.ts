/**
 * Test utilities for oxlint JS plugin rules.
 * Ported from Effect repo's approach: hand-craft AST nodes,
 * invoke visitor handlers directly via a mock context.
 */
import type { CreateRule, Visitor } from '@oxlint/plugins';

// ── Mock context ─────────────────────────────────────────────

export interface ReportedError {
	readonly node: unknown;
	readonly message: string;
}

export interface TestContextOptions {
	readonly filename?: string;
	readonly comments?: ReadonlyArray<{
		readonly type: 'Line' | 'Block';
		readonly value: string;
		readonly start: number;
		readonly end: number;
	}>;
}

export const createTestContext = (options: TestContextOptions = {}) => {
	const { filename = '/test/file.ts', comments = [] } = options;
	const errors: Array<ReportedError> = [];
	const context = {
		id: 'effect/test-rule',
		filename,
		physicalFilename: filename,
		options: [],
		getFilename: () => filename,
		getCwd: () => '/test',
		report(opts: { node: unknown; message: string; loc?: unknown }) {
			errors.push({ node: opts.node, message: opts.message });
		},
		sourceCode: {
			getText() {
				return '';
			},
			getAllComments() {
				return comments;
			},
			getLocFromIndex(index: number) {
				return { line: 1, column: index };
			}
		}
	};
	return { errors, context };
};

/**
 * Call a visitor handler with a test AST node.
 *
 * Visitor handlers are typed for specific node types, but test nodes are
 * hand-crafted `unknown` objects. Indexing `Visitor` with a `string`
 * variable uses the `Record<string, ...>` branch of VisitorObject,
 * yielding the wider `((node: Node) => void) | undefined`.
 */
const callHandler = (visitors: Visitor, key: string, node: unknown): void => {
	const handler = visitors[key];
	// `as never` needed: test nodes are plain objects, not real AST nodes
	if (handler) handler(node as never);
};

/** Invoke a single visitor handler on a single AST node. */
export const runRule = (
	rule: CreateRule,
	visitor: keyof Visitor,
	node: unknown,
	options?: TestContextOptions
): ReadonlyArray<ReportedError> => {
	const { context, errors } = createTestContext(options);
	const visitors = rule.create(context as never);
	callHandler(visitors, visitor, node);
	return errors;
};

/**
 * Invoke multiple visitor/node pairs sequentially through the same context.
 * Required for rules with depth tracking (enter/exit visitors).
 */
export const runRuleMulti = (
	rule: CreateRule,
	pairs: ReadonlyArray<readonly [keyof Visitor, unknown]>,
	options?: TestContextOptions
): ReadonlyArray<ReportedError> => {
	const { context, errors } = createTestContext(options);
	const visitors = rule.create(context as never);
	for (const [visitor, node] of pairs) {
		callHandler(visitors, visitor, node);
	}
	return errors;
};

// ── AST node builders ────────────────────────────────────────

/** Identifier node: `{ type: "Identifier", name }` */
export const id = (name: string) => ({ type: 'Identifier', name }) as const;

/** MemberExpression: `obj.prop` */
export const memberExpr = (obj: string, prop: string) =>
	({
		type: 'MemberExpression',
		object: id(obj),
		property: id(prop),
		computed: false,
		optional: false
	}) as const;

/** CallExpression with Identifier callee: `name(args)` */
export const callExpr = (name: string, args: ReadonlyArray<unknown> = []) =>
	({
		type: 'CallExpression',
		callee: id(name),
		arguments: args
	}) as const;

/** CallExpression with MemberExpression callee: `obj.prop(args)` */
export const callOfMember = (
	obj: string,
	prop: string,
	args: ReadonlyArray<unknown> = []
) =>
	({
		type: 'CallExpression',
		callee: memberExpr(obj, prop),
		arguments: args
	}) as const;

/** ImportDeclaration: `import ... from "source"` */
export const importDecl = (source: string) =>
	({
		type: 'ImportDeclaration',
		source: { type: 'Literal', value: source },
		specifiers: []
	}) as const;

/** NewExpression: `new Callee(args)` */
export const newExpr = (callee: string, args: ReadonlyArray<unknown> = []) =>
	({
		type: 'NewExpression',
		callee: id(callee),
		arguments: args
	}) as const;

/** BinaryExpression: `left op right` */
export const binaryExpr = (operator: string, left: unknown, right: unknown) =>
	({
		type: 'BinaryExpression',
		operator,
		left,
		right
	}) as const;

/** SwitchStatement */
export const switchStmt = () => ({ type: 'SwitchStatement' }) as const;

/** ForStatement */
export const forStmt = () => ({ type: 'ForStatement' }) as const;

/** ForInStatement */
export const forInStmt = () => ({ type: 'ForInStatement' }) as const;

/** ForOfStatement */
export const forOfStmt = () => ({ type: 'ForOfStatement' }) as const;

/** TryStatement */
export const tryStmt = () => ({ type: 'TryStatement' }) as const;

/** ThrowStatement */
export const throwStmt = () => ({ type: 'ThrowStatement' }) as const;

/** YieldExpression: `yield* arg` when delegate=true */
export const yieldExpr = (arg: unknown, delegate = true) =>
	({
		type: 'YieldExpression',
		argument: arg,
		delegate
	}) as const;

/** VariableDeclaration: `kind name = init` */
export const varDecl = (kind: string, name: string, init?: unknown) =>
	({
		type: 'VariableDeclaration',
		kind,
		declarations: [varDeclarator(name, init)]
	}) as const;

/** VariableDeclarator: `name = init` */
export const varDeclarator = (name: string, init?: unknown) =>
	({
		type: 'VariableDeclarator',
		id: id(name),
		init: init ?? null
	}) as const;

/** TSAsExpression: `expr as typeKind` */
export const tsAsExpr = (typeKind: string, parent?: unknown) =>
	({
		type: 'TSAsExpression',
		expression: id('x'),
		typeAnnotation: { type: typeKind },
		parent: parent ?? { type: 'ExpressionStatement' }
	}) as const;

/** TSNonNullExpression: `expr!` */
export const tsNonNull = () =>
	({
		type: 'TSNonNullExpression',
		expression: id('x')
	}) as const;

/** TSUnionType: `T1 | T2 | ...` */
export const tsUnionType = (typeKinds: ReadonlyArray<string>) =>
	({
		type: 'TSUnionType',
		types: typeKinds.map((t) => ({ type: t }))
	}) as const;

/** TSTypeReference: `TypeName` */
export const tsTypeRef = (name: string) =>
	({
		type: 'TSTypeReference',
		typeName: id(name),
		typeArguments: null
	}) as const;

/** TSTypeLiteral: `{ members }` */
export const tsTypeLiteral = (memberCount: number) =>
	({
		type: 'TSTypeLiteral',
		members: Array.from({ length: memberCount }, () => ({
			type: 'TSPropertySignature'
		}))
	}) as const;

/** Program node with optional comments array */
export const program = (
	comments: ReadonlyArray<{
		type: 'Line' | 'Block';
		value: string;
		start: number;
		end: number;
	}> = []
) =>
	({
		type: 'Program',
		body: [],
		comments
	}) as const;

/** TSInterfaceDeclaration: `interface Name { ... }` */
export const interfaceDecl = (name: string) =>
	({
		type: 'TSInterfaceDeclaration',
		id: id(name),
		body: { type: 'TSInterfaceBody', body: [] }
	}) as const;

/** ClassDeclaration: `class Name extends SuperClass { ... }` */
export const classDecl = (name: string, superClass?: unknown) =>
	({
		type: 'ClassDeclaration',
		id: id(name),
		superClass: superClass ?? null,
		body: { type: 'ClassBody', body: [] }
	}) as const;

/** IfStatement */
export const ifStmt = () => ({ type: 'IfStatement' }) as const;

/** Literal string node */
export const strLiteral = (value: string) =>
	({ type: 'Literal', value }) as const;

/** Arrow function expression: `(params) => body` */
export const arrowFn = (body: unknown, params: ReadonlyArray<unknown> = []) =>
	({
		type: 'ArrowFunctionExpression',
		params,
		body
	}) as const;

/** BlockStatement: `{ stmts }` */
export const blockStmt = (body: ReadonlyArray<unknown>) =>
	({
		type: 'BlockStatement',
		body
	}) as const;

/** ReturnStatement: `return arg` */
export const returnStmt = (argument: unknown) =>
	({
		type: 'ReturnStatement',
		argument
	}) as const;

/** WhileStatement */
export const whileStmt = () => ({ type: 'WhileStatement' }) as const;

/** DoWhileStatement */
export const doWhileStmt = () => ({ type: 'DoWhileStatement' }) as const;

/** UnaryExpression: `operator argument` */
export const unaryExpr = (operator: string, argument: unknown) =>
	({
		type: 'UnaryExpression',
		operator,
		argument,
		prefix: true
	}) as const;

/** ImportDeclaration with specifiers */
export const importDeclWithSpecifiers = (
	source: string,
	specifiers: ReadonlyArray<unknown>,
	importKind?: string
) =>
	({
		type: 'ImportDeclaration',
		source: { type: 'Literal', value: source },
		specifiers,
		importKind: importKind ?? 'value'
	}) as const;

/** ImportSpecifier: `import { imported as local } from "..."` */
export const importSpecifier = (
	imported: string,
	local?: string,
	importKind?: string
) =>
	({
		type: 'ImportSpecifier',
		imported: id(imported),
		local: id(local ?? imported),
		importKind: importKind ?? 'value'
	}) as const;

/** ImportNamespaceSpecifier: `import * as local from "..."` */
export const importNamespaceSpecifier = (local: string) =>
	({
		type: 'ImportNamespaceSpecifier',
		local: id(local)
	}) as const;

/** ExportNamedDeclaration wrapping a declaration */
export const exportNamedDecl = (declaration: unknown) =>
	({
		type: 'ExportNamedDeclaration',
		declaration
	}) as const;

/** TSTypeAliasDeclaration: `type Name = ...` */
export const typeAliasDecl = (name: string) =>
	({
		type: 'TSTypeAliasDeclaration',
		id: id(name)
	}) as const;

/** ObjectExpression with properties */
export const objectExpr = (
	properties: ReadonlyArray<{ key: unknown; value?: unknown }>
) =>
	({
		type: 'ObjectExpression',
		properties: properties.map((p) => ({
			type: 'Property',
			key: p.key,
			value: p.value ?? { type: 'Literal', value: '' }
		}))
	}) as const;

/** PropertyDefinition (class instance property) */
export const propertyDef = (name: string, isStatic = false) =>
	({
		type: 'PropertyDefinition',
		key: id(name),
		static: isStatic
	}) as const;

/** MethodDefinition (class method) */
export const methodDef = (name: string, isStatic = false) =>
	({
		type: 'MethodDefinition',
		key: id(name),
		static: isStatic
	}) as const;

/** ClassDeclaration with body members */
export const classDeclWithBody = (
	name: string,
	superClass: unknown,
	members: ReadonlyArray<unknown>
) =>
	({
		type: 'ClassDeclaration',
		id: id(name),
		superClass,
		body: { type: 'ClassBody', body: members }
	}) as const;
