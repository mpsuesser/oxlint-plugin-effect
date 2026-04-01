import { Rule } from 'effect-oxlint';

export default Rule.banMember('Option', 'getOrThrow', {
	message:
		'Do not use `Option.getOrThrow` — it defeats the purpose of Option. Use `Option.match`, `Option.getOrElse`, or `Option.map` to handle both cases explicitly. (EF-2)'
});
