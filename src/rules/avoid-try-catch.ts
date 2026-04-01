import { Rule } from 'effect-oxlint';

export default Rule.banStatement('TryStatement', {
	message:
		'Avoid try-catch in Effect code. Use `Effect.try` or `Effect.tryPromise` with `Schema.TaggedErrorClass` for typed, composable error handling. (EF-1)'
});
