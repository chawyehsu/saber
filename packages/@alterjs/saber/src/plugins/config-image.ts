import getFileNames from '../utils/getFileNames'
import type { SaberPlugin } from '..'

const ID = 'builtin:config-image'

const configImage: SaberPlugin = {
  name: ID,
  apply: (api) => {
    api.hooks.chainWebpack.tap(ID, (config) => {
      const filename = getFileNames(!api.dev).image

      config.module
        .rule('image')
        .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/])
        .use('url-loader')
        .loader(require.resolve('url-loader'))
        .options({
          esModule: false,
          name: filename,
          // inline the file if smaller than 2KB
          limit: 20000,
        })

      config.module
        .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .use('file-loader')
        // SVG files use file-loader directly
        // See https://github.com/facebookincubator/create-react-app/pull/1180
        .loader(require.resolve('file-loader'))
        .options({
          esModule: false,
          name: filename,
        })
    })
  },
}

export default configImage
