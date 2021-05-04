const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const path = require('path')

exports.createConfig = (config, target = { chrome: 52, firefox: 48 }) => {
  const { VueLoaderPlugin } = require('vue-loader')

  const bubleOptions = {
    target,
    objectAssign: 'Object.assign',
    transforms: {
      forOf: false,
      modules: false
    }
  }

  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const workspace = path.basename(process.cwd())

  const baseConfig = {
    mode,
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@front': '@vue-devtools/app-frontend/src',
        '@back': '@vue-devtools/app-backend-core/lib',
        '@utils': '@vue-devtools/shared-utils/lib'
      },
      symlinks: false,
      fallback: {
        path: require.resolve('path-browserify')
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
          test: /\.(css|postcss|pcss)$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader',
            'stylus-loader',
            {
              loader: 'style-resources-loader',
              options: {
                patterns: [
                  require.resolve('@vue-devtools/app-frontend/src/assets/style/imports.styl')
                ]
              }
            }
          ]
        },
        {
          test: /\.(png|woff2|svg)$/,
          type: 'asset/inline'
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
    devtool: 'eval-source-map',
    devServer: {
      port: process.env.PORT
    },
    stats: {
      colors: true
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(process.cwd(), 'node_modules/.cache/webpack'),
      name: `${workspace}-${mode}`
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const TerserPlugin = require('terser-webpack-plugin')
    baseConfig.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      })
    )
    baseConfig.optimization = {
      minimizer: [
        new TerserPlugin({
          exclude: /backend/,
          terserOptions: {
            compress: {
              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,

              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb

              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true
            },
            mangle: {
              safari10: true
            }
          },
          parallel: true
        })
      ]
    }
  }

  return mergeWithRules({
    module: {
      rules: {
        test: 'match',
        loader: 'replace',
        options: 'merge'
      }
    }
  })(baseConfig, config)
}
