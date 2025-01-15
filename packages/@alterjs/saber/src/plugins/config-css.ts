import merge from 'lodash.merge'
import type Config from 'webpack-chain'
// @ts-expect-error - no types
import OptimizeCSSPlugin from '@intervolga/optimize-cssnano-plugin'
import getFileNames from '../utils/getFileNames'
import type { SaberPlugin } from '..'

const ID = 'builtin:config-css'

const configCss: SaberPlugin = {
  name: ID,
  apply: (api) => {
    api.hooks.chainWebpack.tap(ID, (config: Config, { type }) => {
      const {
        extractCSS,
        loaderOptions,
        cssSourceMap: sourceMap,
      } = api.config.build
      const isServer = type === 'server'
      // Disable CSS extraction in dev mode for better build performance(?)
      const shouldExtract = extractCSS && !api.dev
      // if building for production but not extracting CSS, we need to minimize
      // the embbeded inline CSS as they will not be going through the optimizing
      // plugin.
      const needInlineMinification = !api.dev && !shouldExtract
      const fileNames = getFileNames(!api.dev)

      const cssnanoOptions: any = {
        safe: true,
        autoprefixer: { disable: true },
        mergeLonghand: false,
      }
      if (sourceMap) {
        cssnanoOptions.map = { inline: false }
      }

      const extractOptions = {
        filename: fileNames.css,
        chunkFilename: fileNames.css.replace(/\.css$/, '.chunk.css'),
      }

      const createCSSRule = (lang: string, test: RegExp, loader?: string, options?: any) => {
        const applyLoaders = (rule: any, modules: any) => {
          if (shouldExtract && !isServer) {
            rule
              .use('extract-css-loader')
              .loader(require('mini-css-extract-plugin').loader)
          } else {
            rule
              .use('vue-style-loader')
              .loader(require.resolve('vue-style-loader'))
              .options({
                sourceMap,
              })
          }

          const cssLoaderOptions = Object.assign(
            {
              sourceMap,
              modules: modules?.mode
                ? {
                    mode: modules.mode,
                    localIdentName: '[local]_[hash:base64:5]',
                    exportOnlyLocals: isServer && shouldExtract,
                  }
                : modules,
              importLoaders:
                1 // stylePostLoader injected by vue-loader
                + 1 // postcss-loader
                + (needInlineMinification ? 1 : 0),
            },
            loaderOptions.css,
          )

          rule
            .use('css-loader')
            .loader(require.resolve('css-loader'))
            .options(cssLoaderOptions)

          if (needInlineMinification) {
            rule
              .use('minify-inline-css')
              .loader(require.resolve('postcss-loader'))
              .options({
                postcssOptions: {
                  plugins: [require('cssnano')(cssnanoOptions)],
                },
              })
          }

          rule
            .use('postcss-loader')
            .loader(require.resolve('postcss-loader'))
            .options({
              postcssOptions: Object.assign(
                {
                  // FIXME(chawyehsu): https://github.com/webpack-contrib/postcss-loader/issues/204#issuecomment-406774707
                  plugins: [],
                  sourceMap,
                },
                loaderOptions.postcss,
              ),
            })

          if (loader) {
            rule
              .use(loader)
              .loader(loader)
              .options(Object.assign({ sourceMap }, options))
          }
        }

        const baseRule = config.module.rule(lang).test(test)

        // rules for <style lang="module">
        const vueModulesRule = baseRule
          .oneOf('vue-modules')
          .resourceQuery(/module/)
        applyLoaders(vueModulesRule, true)

        // rules for <style>
        const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
        applyLoaders(vueNormalRule, false)

        // rules for normal CSS imports
        const normalRule = baseRule.oneOf('normal')
        applyLoaders(normalRule, false)
      }

      if (shouldExtract && !isServer) {
        config
          .plugin('extract-css')
          .use(require('mini-css-extract-plugin'), [extractOptions])

        const splitChunks = config.optimization.get('splitChunks')
        config.optimization.splitChunks(
          merge({}, splitChunks, {
            cacheGroups: {
              styles: {
                name: 'styles',
                // necessary to ensure async chunks are also extracted
                test: (m: any) => {
                  return m.type && m.type.includes('css/mini-extract')
                },
                chunks: 'all',
                enforce: true,
              },
            },
          }),
        )

        const optimizeCss = new OptimizeCSSPlugin({ sourceMap, cssnanoOptions })
        config.plugin('optimize-css').use(optimizeCss)
      }

      createCSSRule('css', /\.css$/)
      createCSSRule('postcss', /\.p(ost)?css$/)

      const sassImplementation = api.hasDependency('sass')
        ? api.localRequire('sass')
        : undefined
      createCSSRule(
        'scss',
        /\.scss$/,
        'sass-loader',
        Object.assign(
          {
            implementation: sassImplementation,
          },
          loaderOptions.sass,
        ),
      )
      createCSSRule(
        'sass',
        /\.sass$/,
        'sass-loader',
        Object.assign(
          {
            indentedSyntax: true,
            implementation: sassImplementation,
          },
          loaderOptions.sass,
        ),
      )

      createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
      createCSSRule(
        'stylus',
        /\.styl(us)?$/,
        'stylus-loader',
        Object.assign(
          {
            preferPathResolver: 'webpack',
          },
          loaderOptions.stylus,
        ),
      )
    })
  },
}

export default configCss
