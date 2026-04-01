import { importRule } from '../utils.ts';

export default importRule(
	'Disallow path/node:path imports — use Effect Path service instead',
	[
		{
			source: (s) => s === 'node:path' || s === 'path',
			message:
				"Avoid importing `path`/`node:path`. Use Effect's `Path` service from `@effect/platform` for cross-platform path operations."
		}
	]
);
