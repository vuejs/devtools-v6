module.exports = {
  'root': true,
  'env': {
    'browser': true
  },
  'extends': [
    'standard',
    'plugin:vue/recommended'
  ],
  'globals': {
    'bridge': true,
    'chrome': true,
    'localStorage': true,
    'HTMLDocument': true,
    'name': 'off'
  },
  'rules': {
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'always'
    }]
  }
}
