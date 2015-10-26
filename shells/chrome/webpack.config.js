module.exports = {
  entry: {
    inject: './src/inject.js',
    devtools: './src/devtools.js',
    panel: './src/panel.js',
    background: './src/background.js'
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader:  'babel?optional[]=runtime&loose=all',
      exclude: /node_modules/,
    }]
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false
}
