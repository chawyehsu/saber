import { join } from 'node:path'
import { parse } from 'node:querystring'
import type { SaberPlugin } from '@alterjs/saber'

interface Options {
  adapter?: any
  lazyLoad?: boolean
  placeholder?: boolean
  blendIn?: boolean
  markdownImages?: boolean
}

function detectAdapter(adapter: string): any {
  if (adapter === 'sharp') {
    try {
      require('sharp') // A test
      // return the acutal adapter
      return require('responsive-loader/sharp')
    } catch (e) {
      throw new Error('To use sharp adapter with saber-plugin-image, '
        + 'sharp dependency installation is required.')
    }
  } else if (adapter === 'jimp') {
    try {
      require('jimp') // A test
      // return the acutal adapter
      return require('responsive-loader/jimp')
    } catch (e) {
      throw new Error('To use jimp adapter with saber-plugin-image, '
        + 'jimp dependency installation is required.')
    }
  }

  throw new Error('Invalid adapter option, only "sharp" or "jimp" is allowed.')
}

const ID = 'images'

const PluginImage: SaberPlugin = {
  name: ID,
  apply: (api, options: Options = {}) => {
    options = Object.assign(
      {
        adapter: 'jimp',
        lazyLoad: true,
        placeholder: true,
        blendIn: true,
        markdownImages: true,
      },
      options,
    )

    // update adapter string to the actual imported adapter
    options.adapter = detectAdapter(options.adapter)

    api.renderer.hooks.getVueLoaderOptions.tap(ID, (options) => {
      options.transformAssetUrls = Object.assign({}, options.transformAssetUrls, {
        'saber-image': ['src'],
      })
      return options
    })

    // Convert images in Markdown pages to saber-image
    if (options.markdownImages) {
      api.hooks.chainMarkdown.tap(ID, (config) => {
        config.plugin(ID).use((md: any) => {
          md.core.ruler.push(ID, (state: any) => {
            const { tokens } = state

            for (const token of tokens) {
              if (token.type === 'inline' && token.children) {
                const { children } = token

                // clone children to avoid an infinite loop
                for (const child of [...children]) {
                  if (child.type === 'image' || child.tag === 'img') {
                    child.tag = 'saber-image'
                    child.nesting = 1

                    const src = child.attrGet('src')
                    const querystring = parse(src.split('?')[1])
                    Object.keys(querystring).forEach((key) => {
                      const query = querystring[key]
                      if (query === 'true') {
                        querystring[key] = 'true'
                      }
                      if (query === 'false') {
                        querystring[key] = 'false'
                      }
                    })
                    child.attrSet('data-lazy', JSON.stringify(querystring))

                    // append closing tag for saber-image
                    children.splice(
                      children.indexOf(child) + 1,
                      0,
                      new state.Token('image_close', 'saber-image', -1),
                    )
                  }
                }
              }
            }
          })
        })
      })
    }

    api.hooks.chainWebpack.tap(ID, (config) => {
      config.plugin('constants').tap(([constants]) => [
        Object.assign(constants, {
          __SABER_IMAGE_OPTIONS__: options,
        }),
      ])

      config.module.rule('image').exclude.add(/\.(jpe?g|png)$/i)

      config.module
        .rule(ID)
        .test(/\.(jpe?g|png)$/i)
        .type('asset/resource')
        .use('responsive-loader')
        .loader(require.resolve('responsive-loader'))
        .options({
          name: 'images/[name]-[width].[contenthash:8].[ext]',
          ...options,
        })
    })

    api.browserApi.add(join(__dirname, 'saber-browser.js'))
  },
}

export default PluginImage
