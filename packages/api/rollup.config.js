import path from 'path'
import ts from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const pkg = require('./package.json')

const banner = `/*!
  * ${pkg.name} v${pkg.version}
  * (c) ${new Date().getFullYear()} ${pkg.author.name}
  * @license MIT
  */`

// ensure TS checks only once for each build
let hasTSChecked = false

const outputConfigs = {
  // each file name has the format: `dist/${name}.${format}.js`
  // format being a key of this object
  'esm-bundler': {
    file: pkg.module,
    format: 'es'
  },
  global: {
    file: pkg.unpkg,
    format: 'iife'
  },
  esm: {
    file: pkg.browser,
    format: 'es'
  }
}

const allFormats = Object.keys(outputConfigs)
// in vue-router there are not that many
const packageFormats = allFormats
const packageConfigs = packageFormats.map(format =>
  createConfig(format, outputConfigs[format])
)

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.sourcemap = !!process.env.SOURCE_MAP
  output.banner = banner
  output.externalLiveBindings = false
  output.globals = {
    vue: 'Vue'
  }

  const isGlobalBuild = format === 'global'

  if (isGlobalBuild) output.name = 'VueDevtools'

  const shouldEmitDeclarations = !hasTSChecked

  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations
      },
      exclude: ['__tests__', 'test-dts']
    }
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  const external = ['vue']

  const nodePlugins = [resolve(), commonjs()]

  return {
    input: 'src/index.ts',
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [tsPlugin, ...nodePlugins, ...plugins],
    output
    // onwarn: (msg, warn) => {
    //   if (!/Circular/.test(msg)) {
    //     warn(msg)
    //   }
    // },
  }
}
