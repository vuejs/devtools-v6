const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const { VueLoaderPlugin } = require('vue-loader')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

module.exports = (config, target = { chrome: 52, firefox: 48 }) => {
  const bubleOptions = {
    target,
    objectAssign: 'Object.assign',
    transforms: {
      forOf: false,
      modules: false
    }
  }

  const baseConfig = {
    resolve: {
      alias: {
        src: path.resolve(__dirname, '../src'),
        views: path.resolve(__dirname, '../src/devtools/views'),
        components: path.resolve(__dirname, '../src/devtools/components')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'buble-loader',
          exclude: /node_modules|vue\/dist|vuex\/dist/,
          options: bubleOptions
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            },
            transpileOptions: bubleOptions
          }
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'stylus-loader'
          ]
        },
        {
          test: /\.(png|woff2)$/,
          loader: 'url-loader?limit=0'
        }
      ]
    },
    performance: {
      hints: false
    },
    plugins: [
      new VueLoaderPlugin(),
      ...(process.env.VUE_DEVTOOL_TEST ? [] : [new FriendlyErrorsPlugin()]),
      new webpack.DefinePlugin({
        'process.env.RELEASE_CHANNEL': JSON.stringify(process.env.RELEASE_CHANNEL || 'stable')
      })
    ],
    devServer: {
      port: process.env.PORT
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const UglifyPlugin = require('uglifyjs-webpack-plugin')
    baseConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new UglifyPlugin()
    )
  }

  return merge(baseConfig, config)
}
