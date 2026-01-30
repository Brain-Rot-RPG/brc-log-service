import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  // On ignore les dossiers de build
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.mts'] },
  
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  
  {
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      '@stylistic': stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // --- 1. NETTOYAGE AUTO DES IMPORTS ---
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
      ],

      // --- 2. TRI AUTOMATIQUE (Crucial pour la Clean Arch) ---
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // --- 3. STYLE & INDENTATION (Via Stylistic) ---
      '@stylistic/indent': ['error', 4],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'semi', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false }
      }],

      // --- 4. RÈGLES DE RIGUEUR (Sigma Style) ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  }
);