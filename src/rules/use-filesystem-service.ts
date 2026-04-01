import { importRule } from '../utils.ts';

export default importRule(
	'Disallow direct fs imports — use Effect FileSystem service instead',
	[
		{
			source: (s) =>
				s === 'node:fs' ||
				s === 'fs' ||
				s === 'node:fs/promises' ||
				s === 'fs/promises',
			message:
				"Avoid importing `fs`/`node:fs`. Use Effect's `FileSystem` service from `@effect/platform` for typed, composable file operations."
		}
	]
);
