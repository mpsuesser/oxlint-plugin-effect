import { Rule } from 'effect-oxlint';

export default Rule.banMember('Effect', ['runSync', 'runPromise', 'runFork'], {
	message:
		'Avoid `Effect.runSync`/`Effect.runPromise`/`Effect.runFork` in library or domain code. Keep runtime execution at the boundary (entrypoint/test harness). Return `Effect` values instead. (EF-21)'
});
