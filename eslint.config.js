import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite.config.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import-x': importX,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        project: ['./tsconfig.app.json'],
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Import 순서 (Airbnb 스타일)
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',

      // 일반 규칙 (Airbnb 스타일)
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      // 디자인 토큰 강제 — hex 코드 직접 사용 금지
      // src/styles/global.css의 Tailwind 토큰을 사용할 것 (bg-primary, text-ink 등)
      // 외부 라이브러리(Kakao Maps 등)에 hex가 필요한 경우에만 eslint-disable-next-line으로 예외 처리
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/]",
          message:
            'hex 코드 직접 사용 금지. Tailwind 토큰을 사용하세요 (bg-primary, text-ink 등). 전체 목록: src/styles/global.css',
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/]",
          message:
            'hex 코드 직접 사용 금지. Tailwind 토큰을 사용하세요 (bg-primary, text-ink 등). 전체 목록: src/styles/global.css',
        },
      ],
    },
  },
  prettier,
);
