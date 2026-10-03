import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'

// Strips whitespace from key names supplied by third-party globals objects
const cleanGlobals = globalsObj =>
  Object.fromEntries(
    Object.entries(globalsObj).map(([key, value]) => [key.trim(), value]),
  )

export default [
  // 1. Global Ignores
  {
    ignores: [
      '**/public/**',
      '**/dist/**',
      '**/build/**',
    ],
  },

  // 2. Base Rules
  js.configs.recommended,
  stylistic.configs.recommended,

  // 3. Client React Application Code
  {
    files: ['client/src/**/*.{js,jsx,mjs}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'import': importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: cleanGlobals({
        ...globals.browser,
        ...globals.jest,
      }),
    },
    settings: {
      react: { version: '19.1' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
      'react/jsx-filename-extension': 'off',
      'jsx-a11y/label-has-associated-control': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.spec.{js,jsx}',
            'server/test/**/*.js',
            '*.setup.js',
            '**/*.config.{js,mjs,cjs}',
          ],
        },
      ],
    },
  },

  // 4. Server, Webpack, and Root Config Files
  {
    files: [
      'server/**/*.js',
      'client/*.config.js',
      '*.config.{js,mjs,cjs}',
      'config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: cleanGlobals({
        ...globals.node,
      }),
    },
  },
]
