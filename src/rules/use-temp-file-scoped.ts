import { Rule } from 'effect-oxlint';

export default Rule.banMultiple(
	{
		imports: [(src: string) => src === 'os' || src === 'node:os'],
		members: [['os', 'tmpdir']]
	},
	{
		name: 'use-temp-file-scoped',
		message:
			'Avoid `os` / `os.tmpdir()` — use `FileSystem.makeTempFileScoped` from `@effect/platform` for scoped temp files with automatic cleanup.'
	}
);
