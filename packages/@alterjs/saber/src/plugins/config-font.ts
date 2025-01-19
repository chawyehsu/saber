import type Config from 'rspack-chain'
import getFileNames from '../utils/getFileNames'
import type { Saber, SaberPlugin } from '..'

const ID = 'builtin:config-font'

const configFont: SaberPlugin = {
  name: ID,
  apply: (api: Saber) => {
    api.hooks.chainWebpack.tap(ID, (config: Config) => {
      const filename = getFileNames(!api.dev).font

      config.module
        .rule('font')
        .test(/\.(eot|otf|ttf|woff2?)(\?.*)?$/i)
        .use('file-loader')
        .loader('file-loader')
        .options({
          name: filename,
        })
    })
  },
}

export default configFont
