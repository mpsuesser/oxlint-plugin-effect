import { Rule } from 'effect-oxlint';

export default Rule.banImport((s) => s === 'node:path' || s === 'path', {
	message:
		"Avoid importing `path`/`node:path`. Use Effect's `Path` service from `@effect/platform` for cross-platform path operations."
});
