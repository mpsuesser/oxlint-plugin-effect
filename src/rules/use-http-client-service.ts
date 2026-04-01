import { importRule } from '../utils.ts';

export default importRule(
	'Disallow http/https imports — use Effect HttpClient instead',
	[
		{
			source: (s) =>
				s === 'node:http' ||
				s === 'http' ||
				s === 'node:https' ||
				s === 'https',
			message:
				'Avoid importing `http`/`https`. Use `HttpClient`, `HttpClientRequest`, and `HttpClientResponse` from Effect for typed, composable HTTP with testable layer substitution. (EF-9b)'
		}
	]
);
