/**
 * Pattern use-path-service.
 *
 * Bans `path` / `node:path` imports — Effect's `Path` service from
 * `@effect/platform` provides cross-platform path operations with a
 * typed surface and layer-based substitution for tests.
 */
import * as Schema from 'effect/Schema';

import { Rule } from 'effect-oxlint';

const PathImportSource = Schema.Literals(['path', 'node:path']).annotate({
	title: 'PathImportSource',
	description:
		'Node `path` module import specifiers. Use `Path.Path` from `@effect/platform` instead.'
});

const isPathImportSource = Schema.is(PathImportSource);

export default Rule.banImport(isPathImportSource, {
	message:
		'Avoid importing `path` / `node:path`. Use the `Path` service from `@effect/platform` for cross-platform path operations. See the `effect-path` skill.'
});
