const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  ignores: [
    '**/dist',
  ],
}, {
  rules: {
    'curly': ['error', 'all'],
    'node/prefer-global/process': 'off',
  },
}, {
  files: [
    'packages/shell-dev*/**',
  ],
  rules: {
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/custom-event-name-casing': 'off',
    'vue/no-deprecated-functional-template': 'off',
    'vue/no-deprecated-filter': 'off',
    'vue/no-unused-refs': 'off',
    'vue/require-component-is': 'off',
    'vue/return-in-computed-property': 'off',
  },
}, {
  files: [
    'packages/shell-host/**',
  ],
  rules: {
    'no-console': 'off',
  },
}, {
  files: [
    'package.json',
    'packages/*/package.json',
    'packages/*/manifest.json',
  ],
  rules: {
    'style/eol-last': 'off',
  },
})
