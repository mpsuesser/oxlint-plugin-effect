/**
 * Pattern EF-41 / use-filesystem-service.
 *
 * Bans both the synchronous `fs` / `node:fs` and the Promise-based
 * `fs/promises` / `node:fs/promises` modules. The Effect `FileSystem`
 * service from `@effect/platform` covers both surfaces with typed
 * errors and composable Effect values — there is no reason for domain
 * code to reach for either Node module directly.
 */
import * as Schema from 'effect/Schema';

import { Rule } from 'effect-oxlint';

const FsImportSource = Schema.Literals([
	'fs',
	'node:fs',
	'fs/promises',
	'node:fs/promises'
]).annotate({
	title: 'FsImportSource',
	description:
		'Node `fs` module import specifiers — both the legacy callback/sync API and the Promise-based variant. Use `FileSystem` from `@effect/platform` instead.'
});

const isFsImportSource = Schema.is(FsImportSource);

export default Rule.banImport(isFsImportSource, {
	message:
		'Avoid importing `fs` / `node:fs` / `fs/promises`. Use the `FileSystem` service from `@effect/platform` for typed, Effect-native file I/O. See the `effect-filesystem` skill.'
});
