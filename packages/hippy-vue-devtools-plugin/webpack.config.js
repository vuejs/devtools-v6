const path = require('path')
const webpack = require('webpack')
const { createConfig } = require('@vue-devtools/build-tools')

const target = {
  chrome: 52,
  firefox: 48,
  safari: 9,
  ie: 11,
}

module.exports = createConfig({
  entry: {
    // index: './src/index.ts',
    backend: './src/backend.js',
    hook: './src/hook.js',
  },
  output: {
    path: path.join(__dirname, '/lib'),
    publicPath: '/lib/',
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.RELEASE_CHANNEL': JSON.stringify(process.env.RELEASE_CHANNEL || 'stable'),
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: true,
      /**
       * define this to ignore declaration this variable by 'let __resourceQuery=""',
       * webpack will replace this field as module query params
       */
      __resourceQuery: '__resourceQuery',
    }),
  ],
}, target)
