const path = require('node:path')
const { createConfig } = require('@vue-devtools/build-tools')
const { VueLoaderPlugin } = require('vue-loader')

const vueLoaderPath = require.resolve('vue-loader')
const openInEditor = require('launch-editor-middleware')

const config = createConfig({
  entry: {
    // devtools: require.resolve('@vue-devtools/shell-host/src/devtools.js'),
    'backend': require.resolve('@vue-devtools/shell-host/src/backend.js'),
    'hook': require.resolve('@vue-devtools/shell-host/src/hook.js'),
    'target': './src/index.js',
    'iframe-app': './src/iframe-app.js',
  },
  resolve: {
    alias: {
      vue: require.resolve('vue/dist/vue.esm.js'),
    },
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: vueLoaderPath,
        options: {},
      },
    ],
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/target/',
    filename: '[name].js',
  },
  devServer: {
    onBeforeSetupMiddleware({ app }) {
      app.use('/__open-in-editor', openInEditor())
    },
    proxy: {
      '/': {
        target: 'http://localhost:8091',
        bypass: (req, res, proxyOptions) => {
          if (req.url.startsWith('/target')) {
            return req.url
          }
        },
      },
    },
  },
})

config.plugins[0] = new VueLoaderPlugin()
module.exports = config
