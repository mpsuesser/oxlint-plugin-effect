import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';

import { AST, Diagnostic, Rule, RuleContext } from 'effect-oxlint';

export default Rule.define({
	name: 'avoid-schema-suffix',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow Schema suffix on schema constant names — name after the domain type instead'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return {
			VariableDeclarator: (node: ESTree.Node) => {
				const decl = node as ESTree.VariableDeclarator;

				// Check `const fooSchema = Schema.*`
				if (
					decl.id.type !== 'Identifier' ||
					!decl.id.name.endsWith('Schema') ||
					decl.id.name === 'Schema'
				) {
					return Effect.void;
				}

				if (!decl.init) return Effect.void;

				// Check if init references Schema in any form:
				// 1. Schema.Foo(...)
				// 2. Schema.String (bare member access)
				// 3. Schema.String.pipe(...) (chained call)
				const isSchemaInit =
					// Schema.Foo(...)
					(decl.init.type === 'CallExpression' &&
						decl.init.callee.type === 'MemberExpression' &&
						AST.isMember(
							decl.init.callee,
							'Schema',
							decl.init.callee.property.type === 'Identifier'
								? decl.init.callee.property.name
								: ''
						)) ||
					// Schema.String (bare member access)
					(decl.init.type === 'MemberExpression' &&
						decl.init.object.type === 'Identifier' &&
						decl.init.object.name === 'Schema') ||
					// Schema.String.pipe(...)
					(decl.init.type === 'CallExpression' &&
						decl.init.callee.type === 'MemberExpression' &&
						decl.init.callee.object.type === 'MemberExpression' &&
						decl.init.callee.object.object.type === 'Identifier' &&
						decl.init.callee.object.object.name === 'Schema');

				if (isSchemaInit) {
					return ctx.report(
						Diagnostic.make({
							node,
							message: `Avoid naming schema constants with a "Schema" suffix. Name \`${decl.id.name}\` after the domain type it represents (e.g., \`${decl.id.name.replace(/Schema$/, '')}\`). (EF-3, EF-8)`
						})
					);
				}

				return Effect.void;
			}
		};
	}
});
