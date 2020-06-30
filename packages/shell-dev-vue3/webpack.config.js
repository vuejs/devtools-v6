const path = require('path')
const { createConfig } = require('@vue-devtools/build-tools')
const { VueLoaderPlugin } = require('vue-loader')
const openInEditor = require('launch-editor-middleware')

module.exports = createConfig({
  context: __dirname,
  entry: {
    target: './src/main.js',
    hook: require.resolve('@vue-devtools/shell-host/src/hook.js'),
    backend: require.resolve('@vue-devtools/shell-host/src/backend.js')
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/target/',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      vue: require.resolve('vue/dist/vue.esm-bundler.js')
    },
    symlinks: false
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: require.resolve('vue-loader')
      }
    ]
  },
  devtool: '#cheap-module-source-map',
  devServer: {
    port: 8090,
    quiet: true,
    before (app) {
      app.use('/__open-in-editor', openInEditor())
    },
    proxy: {
      '/': {
        target: 'http://localhost:8091',
        bypass: (req, res, proxyOptions) => {
          if (req.url.startsWith('/target')) {
            return req.url
          }
        }
      }
    }
  }
})

module.exports.plugins[0] = new VueLoaderPlugin()
