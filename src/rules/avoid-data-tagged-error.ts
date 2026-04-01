import { Rule } from 'effect-oxlint';

export default Rule.banMember('Data', 'TaggedError', {
	message:
		'Use `Schema.TaggedErrorClass` instead of `Data.TaggedError`. Schema-based errors integrate with decode/encode and carry structured metadata. (EF-1)'
});
