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
        .type('asset/resource')
        .generator({
          filename,
        })

      // allow inline SVGs
      config.module
        .rule('svg')
        .test(/\.(svg)(\?.*)?$/)
        .type('asset/inline')
    })
  },
}

export default configImage
