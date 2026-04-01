import { importRule } from '../utils.ts';

export default importRule(
	'Disallow child_process imports — use Effect CommandExecutor service instead',
	[
		{
			source: (s) => s === 'node:child_process' || s === 'child_process',
			message:
				"Avoid importing `child_process`. Use Effect's `Command` and `CommandExecutor` from `@effect/platform` for typed, composable process spawning with automatic lifecycle management."
		}
	]
);
