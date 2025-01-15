import merge from 'lodash.merge'
import type Config from 'webpack-chain'
import { EsbuildPlugin } from 'esbuild-loader'
// @ts-expect-error - no types
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
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
      // Minify inline CSS in production mode
      const needInlineMinification = !api.dev

      const fileNames = getFileNames(!api.dev)

      const extractOptions = {
        filename: fileNames.css,
        chunkFilename: fileNames.css.replace(/\.css$/, '.chunk.css'),
      }

      // Extracted CSS minification via esbuild
      if (shouldExtract && !isServer) {
        config.optimization.minimizer('css').use(EsbuildPlugin, [
          {
            css: true,
          },
        ])
      }

      const createCSSRule = (lang: string, test: RegExp, loader?: string, options?: any) => {
        const applyLoaders = (rule: any, modules: any) => {
          if (shouldExtract && !isServer) {
            rule
              .use('extract-css-loader')
              .loader(MiniCssExtractPlugin.loader)
          } else if (!shouldExtract) {
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
                1 // postcss-loader
                + (needInlineMinification ? 1 : 0), // esbuild-loader
            },
            loaderOptions.css,
          )

          rule
            .use('css-loader')
            .loader(require.resolve('css-loader'))
            .options(cssLoaderOptions)

          // Inline CSS minification via esbuild
          if (needInlineMinification) {
            rule
              .use('minify-inline-css')
              .loader(require.resolve('esbuild-loader'))
              .options({
                loader: 'css',
                minify: true,
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

        // rules for Vue SFC <style lang="module">
        const vueModulesRule = baseRule
          .oneOf('vue-modules')
          .resourceQuery((query: any) => {
            return /\?vue/.test(query) && /module/.test(query)
          })
        applyLoaders(vueModulesRule, true)

        // rules for Vue SFC <style>
        const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
        applyLoaders(vueNormalRule, false)

        // rules for normal CSS imports
        const normalRule = baseRule.oneOf('normal')
        applyLoaders(normalRule, false)
      }

      if (shouldExtract && !isServer) {
        config
          .plugin('extract-css')
          .use(MiniCssExtractPlugin, [extractOptions])

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
