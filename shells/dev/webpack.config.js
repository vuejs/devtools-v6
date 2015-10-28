module.exports = {
  entry: {
    devtools: './src/devtools.js',
    backend: './src/backend.js',
    hook: './src/hook.js',
    target: './target/index.js'
  },
  output: {
    path: __dirname + '/build',
    publicPath: '/build/',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader:  'babel?optional[]=runtime&loose=all',
        exclude: /node_modules|vue\/src/,
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false
}
