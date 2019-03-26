module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForOfStatement',
        message: 'Not supported by bublé'
      }
    ]
  }
}