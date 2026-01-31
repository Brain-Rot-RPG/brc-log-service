import * as eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as unusedImports from 'eslint-plugin-unused-imports';
import * as simpleImportSort from 'eslint-plugin-simple-import-sort';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
    // 1. BLOC D'IGNORANCE GLOBALE
    // On exclut les fichiers de config root pour éviter les conflits avec le scope de tsconfig (src/)
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'eslint.config.mts',
            'jest.config.ts'
        ]
    },

    // 2. CONFIGURATIONS DE BASE
    eslint.configs.recommended,
    ...tseslint.configs.recommended,

    // 3. RÈGLES PERSONNALISÉES ET PLUGINS
    {
        files: ['**/*.ts'], // On applique ceci à tous les fichiers TypeScript restants
        plugins: {
            'unused-imports': unusedImports,
            'simple-import-sort': simpleImportSort,
            '@stylistic': stylistic,
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: process.cwd(),
            },
        },
        rules: {
            // --- Suppression des imports inutilisés ---
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    'vars': 'all',
                    'varsIgnorePattern': '^_',
                    'args': 'after-used',
                    'argsIgnorePattern': '^_'
                }
            ],

            // --- Tri automatique des imports ---
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            // --- Style & Formatage (@stylistic) ---
            '@stylistic/indent': ['error', 4],
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/member-delimiter-style': ['error', {
                multiline: { delimiter: 'semi', requireLast: true },
                singleline: { delimiter: 'semi', requireLast: false }
            }],

            // --- Rigueur TypeScript ---
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            // --- Qualité de code ---
            'no-console': 'error'
        },
    }
);