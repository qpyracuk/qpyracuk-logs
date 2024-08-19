import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		files: ['**/*.ts'],
		ignores: ['node_modules/**', 'dist/**', 'tsup.config.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
			},
			globals: {
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				clearImmediate: 'readonly',
				clearInterval: 'readonly',
				clearTimeout: 'readonly',
				console: 'readonly',
				exports: 'readonly',
				global: 'readonly',
				module: 'readonly',
				process: 'readonly',
				require: 'readonly',
				setImmediate: 'readonly',
				setInterval: 'readonly',
				setTimeout: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			...tsPlugin.configs['recommended-requiring-type-checking'].rules,
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-new': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'no-console': 'warn',
			'no-debugger': 'error',
			'no-dupe-class-members': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'no-console': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'off',
		},
	},
	prettierConfig,
];
