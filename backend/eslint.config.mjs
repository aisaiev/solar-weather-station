// @ts-check
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        files: ['**/*.ts'],
        plugins: {
            prettier: prettierPlugin,
        },
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'prettier/prettier': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
);
