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
        loader:  'babel',
        exclude: /node_modules|vue\/dist|vuex\/dist/,
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.(png|woff2)$/,
        loader: 'url?limit=0'
      }
    ]
  },
  vue: {
    autoprefixer: {
      browsers: ['last 2 Chrome versions']
    }
  },
  devtool: '#eval-source-map'
}
