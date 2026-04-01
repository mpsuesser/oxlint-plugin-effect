import { memberExprRule } from '../utils.ts';

export default memberExprRule(
	'Disallow Effect.runSync/runPromise outside entrypoints — keep runtime execution at boundaries',
	[
		{
			obj: 'Effect',
			prop: ['runSync', 'runPromise', 'runFork'],
			message:
				'Avoid `Effect.runSync`/`Effect.runPromise`/`Effect.runFork` in library or domain code. Keep runtime execution at the boundary (entrypoint/test harness). Return `Effect` values instead. (EF-21)'
		}
	]
);
