import path from 'node:path'
import type { Saber } from '@alterjs/saber'
import urlJoin from 'url-join'

const ID = 'netlify-redirect'

exports.name = ID

exports.apply = (api: Saber) => {
  api.hooks.afterGenerate.tapPromise(ID, async () => {
    const { log } = api
    /** @type {{fs: import('fs-extra') }} */
    const { fs } = api.utils

    const outDir = api.resolveOutDir()

    const getAbsoluteLink = (link: string) => urlJoin(api.config.build.publicUrl, link)

    const getRedirectFileContent = (redirectRoutes: Map<string, any>) => {
      let content = ''
      for (const config of redirectRoutes.values()) {
        content += `${getAbsoluteLink(config.fromPath)} ${getAbsoluteLink(
          config.toPath,
        )} ${config.isPermanent ? '301' : '302'}\n`
      }

      return content
    }

    const generateRedirects = async (redirectRoutes: Map<string, any>) => {
      const redirectFilePath = path.join(outDir, '_redirects')
      const content = getRedirectFileContent(redirectRoutes)
      if (await fs.pathExists(redirectFilePath)) {
        log.info(`Generating _redirects (append)`)
        await fs.appendFile(redirectFilePath, content, 'utf8')
      } else {
        log.info(`Generating _redirects`)
        await fs.outputFile(redirectFilePath, content, 'utf8')
      }
    }

    const allPermalinks = [...api.pages.values()].map(page => page.permalink)
    for (const permalink of allPermalinks) {
      if (permalink.endsWith('.html')) {
        const fromPath = permalink.replace(/\.html$/, '')
        // The fromPath is already used
        const hasRedirect = api.pages.redirectRoutes.has(fromPath)
        // The fromPath is already an existing permalink
        const hasPermalink = allPermalinks.some(
          r => r.replace(/\/$/, '') === fromPath,
        )
        if (!hasRedirect && !hasPermalink) {
          api.pages.createRedirect({
            fromPath,
            toPath: permalink,
          })
        }
      }
    }

    await generateRedirects(api.pages.redirectRoutes)
  })
}
