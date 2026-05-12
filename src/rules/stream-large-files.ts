/**
 * `fs.readFile` / `fs.readFileString` is the correct default for most reads
 * in Effect code — only suggest streaming when the path argument looks
 * heuristically large or unbounded.
 *
 * Heuristics (any one is enough to fire):
 *  - A string literal whose name contains a "large/unbounded" keyword
 *    (`large`, `huge`, `dump`, `archive`, `dataset`, `backup`, `export`,
 *    `log` / `logs`, `jsonl`, `ndjson`, `csv`).
 *  - A computed path: `path.join(...)` / `path.resolve(...)`.
 *  - A collection index access: `files[i]`.
 *  - A property access ending in `.path` (e.g. `item.path`).
 *  - A `+` string concatenation: `dir + file`.
 */

import type { ESTree } from 'effect-oxlint';

import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';
import * as Schema from 'effect/Schema';

import { AST, Diagnostic, Rule, RuleContext, Visitor } from 'effect-oxlint';

// ---------------------------------------------------------------------------
// Schemas: domain checks for the path-heuristic
// ---------------------------------------------------------------------------

/**
 * String literals whose contents suggest a large or unbounded file —
 * typical bulk-export or log-archive names.
 */
const LargeFileNameLiteral = Schema.String.check(
	Schema.isPattern(
		/(?:large|huge|dump|archive|dataset|backup|export|logs?|jsonl|ndjson|csv)/i,
		{
			identifier: 'LargeFileNameLiteralCheck',
			title: 'Large-File Name Literal',
			description:
				'A string literal that names a typically-large or unbounded file (large, huge, dump, archive, dataset, backup, export, log/logs, jsonl, ndjson, csv).',
			message: 'String literal looks like a large or unbounded file'
		}
	)
).pipe(
	Schema.brand('LargeFileNameLiteral'),
	Schema.annotate({
		title: 'LargeFileNameLiteral',
		description:
			'A string literal heuristically indicating a large or unbounded file.'
	})
);

const isLargeFileNameLiteral = Schema.is(LargeFileNameLiteral);

const PathBuilderName = Schema.Literals(['join', 'resolve']).annotate({
	title: 'PathBuilderName',
	description:
		'`path.join` and `path.resolve` are the canonical signs that a path is computed rather than fixed at the call site.'
});

const isPathBuilderName = Schema.is(PathBuilderName);

// ---------------------------------------------------------------------------
// Heuristic detection
// ---------------------------------------------------------------------------

/**
 * Pick a single heuristic hint for the given argument, or `Option.none()`
 * if nothing suspicious is detected. Each branch is an independent
 * `Option`-returning probe; the first match wins via `Option.orElse`.
 */
const detectLargePathHint = (arg: ESTree.Node): Option.Option<string> => {
	// "files/2024/export.log" — large-name string literal
	const fromLiteral = pipe(
		AST.narrow(arg, 'Literal'),
		Option.flatMap((lit) =>
			P.isString(lit.value) && isLargeFileNameLiteral(lit.value)
				? Option.some(
						`path literal "${lit.value}" suggests a large or unbounded file`
					)
				: Option.none<string>()
		)
	);

	// path.join(...) / path.resolve(...)
	const fromPathBuilder = pipe(
		AST.narrow(arg, 'CallExpression'),
		Option.flatMap((call) =>
			pipe(
				AST.narrow(call.callee, 'MemberExpression'),
				Option.flatMap(AST.memberNames)
			)
		),
		Option.flatMap(([obj, prop]) =>
			obj === 'path' && isPathBuilderName(prop)
				? Option.some(
						`path is computed via \`path.${prop}\`, so its size is not bounded by the source`
					)
				: Option.none<string>()
		)
	);

	// files[i] — computed member access
	const fromComputedAccess = pipe(
		AST.narrow(arg, 'MemberExpression'),
		Option.filter((m) => m.computed),
		Option.map(
			() =>
				'path is read from a collection index — likely iterating over many files'
		)
	);

	// item.path — property named "path"
	const fromPathProperty = pipe(
		AST.narrow(arg, 'MemberExpression'),
		Option.filter((m) => !m.computed),
		Option.flatMap((m) =>
			m.property.type === 'Identifier' && m.property.name === 'path'
				? Option.some(
						'path is read from a `.path` property — likely iterating over file records'
					)
				: Option.none<string>()
		)
	);

	// dir + file
	const fromConcat = pipe(
		AST.narrow(arg, 'BinaryExpression'),
		Option.filter((b) => b.operator === '+'),
		Option.map(() => 'path is built via string concatenation')
	);

	return pipe(
		fromLiteral,
		Option.orElse(() => fromPathBuilder),
		Option.orElse(() => fromComputedAccess),
		Option.orElse(() => fromPathProperty),
		Option.orElse(() => fromConcat)
	);
};

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

const messageFor = (hint: string): string =>
	`Consider streaming this read with \`Stream.fromReadableStream\` or \`FileSystem.stream\` — ${hint}. \`fs.readFile\` loads the entire file into memory.`;

export default Rule.define({
	name: 'stream-large-files',
	meta: Rule.meta({
		type: 'suggestion',
		description:
			'Suggest streaming when `fs.readFile` / `fs.readFileString` is called with a path that heuristically points at a large or unbounded file.'
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return Visitor.on('CallExpression', (node) =>
			pipe(
				AST.matchCallOf(node, 'fs', ['readFile', 'readFileString']),
				Option.flatMap((call) =>
					Option.fromNullishOr(call.arguments[0])
				),
				Option.flatMap(detectLargePathHint),
				Option.match({
					onNone: () => Effect.void,
					onSome: (hint) =>
						ctx.report(
							Diagnostic.make({
								node,
								message: messageFor(hint)
							})
						)
				})
			)
		);
	}
});
