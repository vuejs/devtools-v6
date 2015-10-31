module.exports = {
  entry: {
    hook: './src/hook.js',
    devtools: './src/devtools.js',
    background: './src/background.js',
    'devtools-background': './src/devtools-background.js',
    backend: './src/backend.js',
    proxy: './src/proxy.js'
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
  vue: {
    autoprefixer: {
      browsers: ['last 2 Chrome versions']
    }
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? 'inline-source-map'
    : false
}
