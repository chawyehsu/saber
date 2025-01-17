import path from 'node:path'
import { Feed } from 'feed'
import type { Saber } from '@alterjs/saber'
import { getFeedPath, resolveURL } from './utils'

interface Options {
  limit?: number
  generator?: string
  copyright?: string
  jsonFeed?: string | boolean
  atomFeed?: string | boolean
  rss2Feed?: string | boolean
}

interface FeedPost {
  title: string
  id: string
  link: string
  description: string
  content: string
  date: Date
  published: Date
}

const ID = 'generate-feed'

exports.name = ID

exports.apply = (api: Saber, options: Options = {}) => {
  // Plugin options
  options = Object.assign(
    {
      limit: 30,
      generator: 'Saber',
      copyright: 'All rights reserved',
    },
    options,
  )

  const { siteConfig } = api.config
  if (!siteConfig.url) {
    throw new Error(`siteConfig.url is required for saber-plugin-feed`)
  }

  const jsonFeedPath = getFeedPath('feed.json', options.jsonFeed)
  const atomFeedPath = getFeedPath('atom.xml', options.atomFeed)
  const rss2FeedPath = getFeedPath('rss2.xml', options.rss2Feed)

  api.hooks.defineVariables.tap(ID, (variables) => {
    return Object.assign(variables, {
      jsonFeedPath,
      atomFeedPath,
      rss2FeedPath,
    })
  })

  api.browserApi.add(path.join(__dirname, 'saber-browser.js'))

  api.hooks.afterGenerate.tapPromise(ID, async () => {
    const allLocalePaths = new Set(
      ['/'].concat(Object.keys(api.config.locales || {})),
    )
    await Promise.all(
      [...allLocalePaths].map(localePath => generateFeed(localePath)),
    )
  })

  async function generateFeed(localePath: string) {
    // Prepare posts
    const posts: FeedPost[] = []

    await Promise.all(
      [...api.pages.values()].map(async (page) => {
        if (page.type !== 'post' || page.draft) {
          return
        }

        const matchedLocalePath = api.pages.getMatchedLocalePath(page.permalink)
        if (localePath !== matchedLocalePath) {
          return
        }

        const content = await api.renderer.renderPageContent(page.permalink)

        posts.push({
          title: page.title,
          id: resolveURL(siteConfig.url, page.permalink),
          link: resolveURL(siteConfig.url, page.permalink),
          // Strip HTML tags in excerpt and use it as description (a.k.a. summary)
          description:
            page.excerpt && page.excerpt.replace(/<(?:.|\n)*?>/g, ''),
          content,
          date: page.updatedAt || page.createdAt,
          published: page.createdAt,
        })
      }),
    )

    // Order by published
    const items = posts
      .sort((a, b) => {
        return b.published.getTime() - a.published.getTime()
      })
      .slice(0, options.limit)

    // Feed instance
    const feed = new Feed({
      title: siteConfig.title,
      description: siteConfig.description,
      id: siteConfig.url.replace(/\/?$/, '/'), // Ensure that the id ends with a slash
      link: siteConfig.url,
      copyright: options.copyright || 'All rights reserved',
      generator: options.generator,
      author: {
        name: siteConfig.author,
        email: siteConfig.email,
        link: siteConfig.url,
      },
      feedLinks: {
        json: jsonFeedPath && resolveURL(siteConfig.url, jsonFeedPath),
        atom: atomFeedPath && resolveURL(siteConfig.url, atomFeedPath),
      },
    })

    // Add posts to feed
    items.forEach((post) => {
      feed.addItem(post)
    })

    const { log } = api
    const { fs } = api.utils

    const outDir = api.resolveOutDir()

    const writeFeed = async (fileName: string, content: string) => {
      log.info(`Generating ${fileName}`)
      await fs.outputFile(path.join(outDir, fileName), content, 'utf8')
    }

    await Promise.all([
      jsonFeedPath
      && writeFeed(path.join('./', localePath, jsonFeedPath), feed.json1()),
      atomFeedPath
      && writeFeed(path.join('./', localePath, atomFeedPath), feed.atom1()),
      rss2FeedPath
      && writeFeed(path.join('./', localePath, rss2FeedPath), feed.rss2()),
    ])
  }
}
