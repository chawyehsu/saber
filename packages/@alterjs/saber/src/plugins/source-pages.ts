import path from 'node:path'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import glob from 'fast-glob'
import hash from '../utils/hashsum'
import { colors, log } from '../utils/log'
import type { SaberPlugin } from '..'
import type { FileInfo } from '../Pages'

const ID = 'builtin:source-pages'

const sourcePagesPlugin: SaberPlugin = {
  name: ID,

  apply(api) {
    api.hooks.beforeRun.tapPromise(ID, async () => {
      const pagesDir = api.resolveCwd('pages')
      const exts = api.transformers.supportedExtensions
      const filePatterns = [
        `**/*.${exts.length === 1 ? exts[0] : `{${exts.join(',')}}`}`,
        '!**/{node_modules,dist,vendor}/**',
        '!**/_!(posts)/**',
      ]

      const files: FileInfo[] = await glob(filePatterns, {
        cwd: pagesDir,
        dot: false,
        stats: true,
      }).then(files =>
        Promise.all(
          files
            .sort((a, b) => (a.path > b.path ? 1 : -1))
            .map(async (file) => {
              log.verbose(`Found page`, colors.dim(file.path))
              const absolute = path.join(pagesDir, file.path)

              const content = await fs.readFile(absolute, 'utf8')
              return {
                relative: file.path,
                absolute,
                content,
                mtime: file.stats && file.stats.mtime,
                birthtime: file.stats && file.stats.birthtime,
              } as FileInfo
            }),
        ),
      )

      api.hooks.manipulatePage.tapPromise(
        'manipulate-page',
        async ({ action, id, page }) => {
          // Remove all child pages
          api.pages.removeWhere(page => Boolean(page.internal.parent))

          if (action === 'remove') {
            // Remove itself
            api.pages.removeWhere((page) => {
              return page.internal.id === id
            })
          } else if (action) {
            api.pages.createPage(page)
            await api.hooks.onCreatePage.promise(page)
          }
        },
      )

      // Write all pages
      // This is triggered by all file actions: change, add, remove
      api.hooks.emitPages.tapPromise('pages', async () => {
        const pages = [...api.pages.values()]
        log.verbose('Emitting pages')
        // TODO: maybe write pages with limited concurrency?
        await Promise.all(
          pages.map(async (page) => {
            if (page.internal.saved) {
              return
            }

            const newContentHash = hash(page)
            const outPath = api.resolveCache(
              'pages',
              `${page.internal.id}.saberpage`,
            )
            // TODO: is there any better solution to checking if we need to write the page?
            const exists = await fs.pathExists(outPath)
            if (exists) {
              const contentHash = await fs.readFile(outPath, 'utf8')
              if (contentHash === newContentHash) {
                // Skip if content doesn't change
                return
              }
            }

            log.verbose(`Emitting page ${outPath}`)
            await fs.outputFile(outPath, newContentHash, 'utf8')

            page.internal.saved = true
          }),
        )
      })

      await api.hooks.initPages.promise(0)

      await Promise.all(
        files.map(async (file) => {
          const page = api.pages.fileToPage(file)
          api.pages.createPage(page)
          await api.hooks.onCreatePage.promise(page)
        }),
      )

      await api.hooks.onCreatePages.promise(0)
      await api.hooks.emitPages.promise(0)

      if (api.dev) {
        const watcher = chokidar.watch(filePatterns, {
          cwd: pagesDir,
          ignoreInitial: true,
        })
        const handler = (type: 'add' | 'remove' | 'change') => async (
          filename: string,
        ) => {
          const filepath = path.join(pagesDir, filename)

          if (type === 'remove') {
            await api.hooks.manipulatePage.promise({
              action: 'remove',
              id: hash(filepath),
            })
          } else {
            const stat = await fs.stat(filepath)
            const file: FileInfo = {
              absolute: filepath,
              relative: filename,
              birthtime: stat.birthtime,
              mtime: stat.mtime,
              content: await fs.readFile(filepath, 'utf8'),
            }
            const page = api.pages.fileToPage(file)
            await api.hooks.manipulatePage.promise({ action: 'create', page })
          }

          await api.hooks.onCreatePages.promise(0)
          await api.hooks.emitPages.promise(0)
          await api.hooks.emitRoutes.promise(0)
        }

        watcher.on('add', (filename: string) => {
          handler('add')(filename)
        })
        watcher.on('unlink', (filename: string) => {
          handler('remove')(filename)
        })
        watcher.on('change', (filename: string) => {
          handler('change')(filename)
        })
      }
    })
  },
}

export default sourcePagesPlugin
