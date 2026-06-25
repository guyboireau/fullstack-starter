// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Architecture: pages/components must never import Supabase directly.
  // All DB access goes through src/services/ (service-layer rule).
  {
    files: ['src/pages/**/*.{ts,tsx,astro}', 'src/components/**/*.{ts,tsx,astro}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/lib/supabase', '@/lib/supabase'],
            message:
              'Les pages/composants ne doivent pas importer Supabase directement. Passez par un service de src/services/.',
          },
        ],
      }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
)
