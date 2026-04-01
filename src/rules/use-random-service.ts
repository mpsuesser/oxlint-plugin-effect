import { Rule } from 'effect-oxlint';

export default Rule.banMember('Math', 'random', {
	message:
		'Avoid `Math.random()` in Effect code. Use the `Random` service for testable, deterministic randomness. (EF-9)'
});
