const path = require('path')
const { createConfig } = require('@vue-devtools/build-tools')
const openInEditor = require('launch-editor-middleware')

module.exports = createConfig({
  entry: {
    // devtools: require.resolve('@vue-devtools/shell-host/src/devtools.js'),
    backend: require.resolve('@vue-devtools/shell-host/src/backend.js'),
    hook: require.resolve('@vue-devtools/shell-host/src/hook.js'),
    target: './src/index.js',
    'iframe-app': './src/iframe-app.js'
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/target/',
    filename: '[name].js'
  },
  devServer: {
    onBeforeSetupMiddleware (app) {
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
