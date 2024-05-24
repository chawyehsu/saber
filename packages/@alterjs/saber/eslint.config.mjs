import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    overrides: {
      'curly': ['error', 'all'],
      'style/brace-style': ['error', '1tbs'],
    },
  },
})
