module.exports = {
  root: true,
  env: {
    browser: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    bridge: true,
    chrome: true,
    localStorage: true,
    HTMLDocument: true,
    name: 'off'
  },
  rules: {
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always'
      }
    ],
    'no-var': ['error'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none'
        },
        singleline: {
          delimiter: 'comma'
        }
      }
    ],
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/camelcase': 'warn',
    'no-prototype-builtins': 'off'
  },
  overrides: [
    {
      files: [
        'release.js',
        'sign-firefox.js',
        'packages/build-tools/**',
        'packages/shell-electron/**',
        '**webpack.config.js'
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/camelcase': 'off'
      }
    },
    {
      files: ['packages/shell-dev-vue3/**'],
      rules: {
        'vue/valid-template-root': 'off'
      }
    }
  ]
}
