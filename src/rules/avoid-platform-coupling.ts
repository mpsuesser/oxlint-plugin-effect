import { Rule } from 'effect-oxlint';

export default Rule.banImport(
	(src) =>
		src === '@effect/platform-bun' ||
		src.startsWith('@effect/platform-bun/'),
	{
		message:
			'Binding packages must be platform-agnostic. Import from `@effect/platform` (abstract interfaces) instead of `@effect/platform-bun` (concrete implementations). Platform layers belong in the runtime entry point.'
	}
);
