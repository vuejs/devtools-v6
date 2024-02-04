const path = require('node:path')
const openInEditor = require('launch-editor-middleware')
const { createConfig } = require('@vue-devtools/build-tools')

module.exports = createConfig({
  context: __dirname,
  entry: {
    'backend': require.resolve('@vue-devtools/shell-host/src/backend.js'),
    'hook': require.resolve('@vue-devtools/shell-host/src/hook.js'),
    'target': './src/main.js',
    'iframe-app': './src/iframe-app.js',
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: '/target/',
    filename: '[name].js',
  },
  resolve: {
    symlinks: false,
  },
  devServer: {
    port: 8090,
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
