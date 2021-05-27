const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')

exports.createConfig = (config, target = { chrome: 52, firefox: 48 }) => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  // const workspace = path.basename(process.cwd())

  const baseConfig = {
    mode,
    resolve: {
      extensions: ['.js', '.ts', '.vue'],
      alias: {
        '@front': '@vue-devtools/app-frontend/src',
        '@back': '@vue-devtools/app-backend-core/lib',
        '@utils': '@vue-devtools/shared-utils/lib'
      },
      // symlinks: false,
      fallback: {
        path: require.resolve('path-browserify')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules|vue\/dist|vuex\/dist/,
          loader: 'buble-loader',
          options: {
            target,
            objectAssign: 'Object.assign',
            transforms: {
              modules: false,
              asyncAwait: false,
              forOf: false
            }
          }
        },
        {
          test: /\.ts$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'es2015'
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            },
            transpileOptions: {
              target,
              objectAssign: 'Object.assign',
              transforms: {
                modules: false
              }
            }
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
          test: /\.(png|woff2|svg|ttf)$/,
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
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: path.resolve(__dirname, '../../../tsconfig.json'),
          extensions: {
            vue: true
          }
        }
      }),
      new ESLintPlugin({
        threads: true
      }),
      new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript']
      })
    ],
    devtool: 'eval-source-map',
    devServer: {
      port: process.env.PORT
    },
    stats: {
      colors: true
    },
    // cache: {
    //   type: 'filesystem',
    //   cacheDirectory: path.resolve(process.cwd(), 'node_modules/.cache/webpack'),
    //   name: `${workspace}-${mode}`
    // },
    snapshot: {
      managedPaths: []
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
              collapse_vars: false,
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
              booleans: true,
              if_return: true,
              sequences: true,
              unused: true,

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
