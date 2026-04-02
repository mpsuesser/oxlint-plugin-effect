import { defineConfig } from 'vite-plus';

export default defineConfig({
	test: {
		setupFiles: [`${import.meta.dirname}/vitest.setup.ts`],
		include: ['test/**/*.test.ts'],
		passWithNoTests: true,
		globals: false,
		testTimeout: 30000,
		hookTimeout: 30000,
		pool: 'forks',
		isolate: false
	},
	fmt: {
		useTabs: true,
		tabWidth: 4,
		printWidth: 80,
		endOfLine: 'lf',
		singleQuote: true,
		arrowParens: 'always',
		bracketSpacing: true,
		quoteProps: 'preserve',
		semi: true,
		trailingComma: 'none',
		ignore: ['*.md'],
		overrides: [
			{
				files: ['*.json', '*.jsonc'],
				options: {
					useTabs: false,
					tabWidth: 2
				}
			}
		]
	},
	staged: {
		'*.{ts,tsx,js,jsx}': ['vp check --fix', 'vitest run']
	},
	lint: {
		plugins: ['typescript', 'import', 'unicorn', 'vitest'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-extra-non-null-assertion': 'error',
			'vitest/require-to-throw-message': 'off'
		},
		overrides: [
			{
				files: ['**/*.{test,spec}.*'],
				rules: {}
			}
		],
		options: {
			typeAware: true,
			typeCheck: true
		}
	}
});
