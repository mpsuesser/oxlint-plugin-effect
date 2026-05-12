/**
 * Temp files must clean up. Effect provides scoped temp APIs that close
 * automatically when the surrounding scope ends. This rule flags:
 *
 *  - `import "os"` / `import "node:os"` — Node-coupled tempdir source
 *  - `os.tmpdir()` member access — direct tempdir read, manual cleanup
 *  - `<fs>.makeTempFile(...)` / `<fs>.makeTempDirectory(...)` calls —
 *    the unscoped Effect platform variants; their scoped siblings
 *    (`makeTempFileScoped` / `makeTempDirectoryScoped`) clean up via
 *    scope finalization.
 *
 * The unscoped `makeTemp*` detection is intentionally permissive on the
 * object name — any receiver (`fs`, `FileSystem`, `platform`) is matched
 * since the call shape itself is the smell.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Domain
// ---------------------------------------------------------------------------

const OsImportSource = Schema.Literals(['os', 'node:os']).annotate({
	title: 'OsImportSource',
	description:
		"Import sources for Node's built-in `os` module that expose `tmpdir()`."
});

const isOsImportSource = Schema.is(OsImportSource);

const UnscopedTempApiName = Schema.Literals([
	'makeTempFile',
	'makeTempDirectory'
]).annotate({
	title: 'UnscopedTempApiName',
	description:
		'Effect platform FileSystem APIs that allocate a temp resource without binding cleanup to a scope.'
});

const isUnscopedTempApiName = Schema.is(UnscopedTempApiName);

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

/**
 * Extract the property name when a `MemberExpression` calls a member
 * matching one of the unscoped temp APIs, regardless of the receiver.
 * Returns `Option<UnscopedTempApiName>` so the diagnostic can name the
 * specific API.
 */
const matchUnscopedTempMember = (
	node: ESTree.MemberExpression
): Option.Option<string> =>
	pipe(
		AST.memberNames(node),
		Option.flatMap(([, prop]) =>
			isUnscopedTempApiName(prop) ? Option.some(prop) : Option.none()
		)
	);

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const IMPORT_MESSAGE =
	'Avoid `os` / `node:os` — use `FileSystem.makeTempFileScoped` from `@effect/platform` for scoped temp files with automatic cleanup.';

const TMPDIR_MESSAGE =
	'Avoid `os.tmpdir()` — use `FileSystem.makeTempFileScoped` from `@effect/platform` for scoped temp files with automatic cleanup.';

const unscopedMessage = (api: string): string =>
	`Avoid \`${api}\` — the unscoped variant requires manual cleanup. Use \`${api}Scoped\` so the resource is finalized when its scope closes.`;

export default Rule.define({
	name: 'use-temp-file-scoped',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Disallow `os`/`os.tmpdir()` and the unscoped `makeTempFile` / `makeTempDirectory` FileSystem APIs — prefer their `*Scoped` siblings so cleanup is bound to scope finalization.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;

		return Visitor.merge(
			Visitor.on('ImportDeclaration', (node) =>
				isOsImportSource(AST.importSource(node))
					? ctx.report(
							Diagnostic.make({ node, message: IMPORT_MESSAGE })
						)
					: Effect.void
			),
			Visitor.on('MemberExpression', (node) =>
				pipe(
					AST.matchMember(node, 'os', 'tmpdir'),
					Option.match({
						onNone: () => Effect.void,
						onSome: (matched) =>
							ctx.report(
								Diagnostic.make({
									node: matched,
									message: TMPDIR_MESSAGE
								})
							)
					})
				)
			),
			Visitor.on('CallExpression', (node) =>
				pipe(
					AST.narrow(node.callee, 'MemberExpression'),
					Option.flatMap(matchUnscopedTempMember),
					Option.match({
						onNone: () => Effect.void,
						onSome: (api) =>
							ctx.report(
								Diagnostic.make({
									node,
									message: unscopedMessage(api)
								})
							)
					})
				)
			)
		);
	}
});
