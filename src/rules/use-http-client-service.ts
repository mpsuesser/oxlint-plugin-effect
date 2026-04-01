import { Rule } from 'effect-oxlint';

export default Rule.banImport(
	(s) =>
		s === 'node:http' ||
		s === 'http' ||
		s === 'node:https' ||
		s === 'https',
	{
		message:
			'Avoid importing `http`/`https`. Use `HttpClient`, `HttpClientRequest`, and `HttpClientResponse` from Effect for typed, composable HTTP with testable layer substitution. (EF-9b)'
	}
);
