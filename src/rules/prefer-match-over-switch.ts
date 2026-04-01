import { Rule } from 'effect-oxlint';

export default Rule.banStatement('SwitchStatement', {
	message:
		'Avoid `switch` statements in Effect code. Use `Match.value(...).pipe(Match.when(...), ..., Match.exhaustive)` for exhaustive, type-safe branching. (EF-7)'
});
