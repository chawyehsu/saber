import path from 'node:path'
import type { Saber } from '@alterjs/saber'
import urlJoin from 'url-join'

const ID = 'meta-redirect'

exports.name = ID

exports.apply = (api: Saber) => {
  api.hooks.afterGenerate.tapPromise(ID, async () => {
    const { log } = api
    const { fs } = api.utils

    const outDir = api.resolveOutDir()

    const getFileNameFromLink = (link: string) => {
      const filename = link.endsWith('.html')
        ? link
        : link.replace(/\/?$/, '/index.html')
      return path.join(outDir, filename)
    }

    const getPageContent = (toPath: string) => {
      return `<!DOCTYPE html><meta http-equiv="refresh" content="0;url=${urlJoin(
        api.config.build.publicUrl,
        toPath,
      )}" />`
    }

    const writePage = async (config: {
      fromPath: string
      toPath: string
    }) => {
      const fileName = getFileNameFromLink(config.fromPath)
      log.info(`Generating ${path.relative(outDir, fileName)}`)
      await fs.outputFile(fileName, getPageContent(config.toPath), 'utf8')
    }

    const configs = [...api.pages.redirectRoutes.values()]
    await Promise.all(configs.map(config => writePage(config)))
  })
}
