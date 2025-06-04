import path from 'node:path'
import { env } from 'node:process'
import Config from 'rspack-chain'
import webpack from 'webpack'
import getFileNames from '../utils/getFileNames'
import type { Saber } from '..'
// import timeFixPlugin from './TimeFixPlugin'
import PrintStatusPlugin from './PrintStatusPlugin'

export default function webpackConfig(api: Saber, { type }: { type: string }): Config {
  const config = new Config()

  config.mode(api.dev ? 'development' : 'production')
  config.devtool(
    type === 'server'
      ? 'source-map'
      : api.dev
        ? 'cheap-module-source-map'
        : false,
  )

  const fileNames = getFileNames(!api.dev)

  // Disable cache if cache is disabled in saber config
  if (api.config.build.cache === false) {
    config.cache(false)
  }

  config.output
    .publicPath(`${api.config.build.publicUrl}_saber/`)
    .filename(fileNames.js)

  config.resolve.extensions.merge(['.mjs', '.js', '.json', '.wasm'])

  // Disable performance hints
  config.performance.hints(false)

  if (type === 'server') {
    config.output.libraryTarget('commonjs2')
    config.target('node')
  }

  config.resolve.alias.set('#pages', api.resolveCwd('pages'))
  config.resolve.alias.set('#cache', api.resolveCwd('.saber'))
  config.resolve.alias.set('#theme', api.theme)
  config.resolve.alias.set('@', api.opts.cwd)
  config.resolve.alias.set('saber-config$', api.resolveCache('config.json'))
  config.resolve.alias.set('saber/config$', api.resolveCache('config.json'))
  config.resolve.alias.set(
    'saber/variables$',
    api.resolveCache('variables.json'),
  )

  const ownModulesDir = path.join(
    path.dirname(require.resolve('vue/package.json')),
    '..',
  )
  config.resolve.modules.add('node_modules').add(ownModulesDir)
  config.resolveLoader.modules.add('node_modules').add(ownModulesDir)

  config.module
    .rule('js')
    .test(/\.js$/)
    .include.add((filepath: string) => {
      if (api.browserApi.has(filepath)) {
        return true
      }

      if (/node_modules/.test(filepath)) {
        return false
      }

      return true
    })
    .end()
    .oneOf('normal')
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
      loader: 'js',
      target: 'es2015',
    })

  // config.plugin('timefix').use(timeFixPlugin)

  config.plugin('envs').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  ])

  config.plugin('constants').use(webpack.DefinePlugin, [
    {
      'process.browser': type === 'client',
      'process.client': type === 'client',
      'process.server': type === 'server',
      '__DEV__': api.dev,
      '__PUBLIC_URL__': JSON.stringify(api.config.build.publicUrl),
      '__LAZY__': api.config.build.lazy && api.dev,
      '__SABER_VERSION__': JSON.stringify(require('../../package.json').version),
    },
  ])

  config.plugin('print-status').use(new PrintStatusPlugin({ api, type }))

  if (api.compilers[type]) {
    api.compilers[type].injectToWebpack(config)
  }

  // https://webpack.js.org/migrate/5/#test-webpack-5-compatibility
  // config.node.merge({ Buffer: false })
  // something complains about `process` not being defined, we might not be able
  // to set this to false for now
  // config.node.merge({ 'process': false })

  return config
}
