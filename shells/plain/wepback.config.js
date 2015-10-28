module.exports = {
  entry: {
    devtool: './src/devtool.js',
    backend: './src/backend.js'
  },
  output: {
    path: __dirname + '/build',
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
