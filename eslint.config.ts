import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    rules: {
      'import/order': [
        'error',
        {
          'groups': [
            ['type'],
            ['builtin', 'external'],
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],
    },
  },
)
