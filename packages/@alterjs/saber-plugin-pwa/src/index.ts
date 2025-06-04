import path from 'node:path'
import fs from 'node:fs'
import type { Saber } from '@alterjs/saber'
import { generateSW } from 'workbox-build'
import generateManifest from './generate-manifest'
import getAppConfig from './get-app-config'
import createElement from './create-element'

interface SWOptions {
  globPatterns?: string[]
}

interface ManifestIcon {
  src: string
  type?: string
  sizes?: string
}

interface Manifest {
  icons?: ManifestIcon[]
}

const ID = 'pwa'

exports.name = ID

exports.apply = (
  api: Saber,
  { notifyUpdates = true, generateSWOptions = {}, ...appConfig }: {
    notifyUpdates?: boolean
    generateSWOptions?: SWOptions
    name?: string
    themeColor?: string
    assetsVersion?: string
    appleTouchIcon?: string
  } = {},
) => {
  if (api.dev) {
    // Uninstall server-worker.js in dev mode
    api.hooks.onCreateServer.tap(ID, (server) => {
      server.use(require('./noop-sw-middleware')())
    })
  } else {
    api.browserApi.add(path.join(__dirname, 'saber-browser.js'))

    api.hooks.chainWebpack.tap(ID, (config) => {
      config.plugin('constants').tap(([options]) => [
        Object.assign(options, {
          __PWA_OPTIONS__: JSON.stringify({
            notifyUpdates,
          }),
        }),
      ])
    })

    const { name, themeColor, assetsVersion, appleTouchIcon } = getAppConfig(
      Object.assign({ name: api.config.siteConfig.title }, appConfig),
    )

    const manifestPath = api.resolveCwd('static/manifest.json')
    const hasManifest = fs.existsSync(manifestPath)
    const manifest: Manifest = hasManifest ? require(manifestPath) : {}

    api.hooks.afterGenerate.tapPromise(ID, async () => {
      await generateSW({
        ...generateSWOptions,
        swDest: api.resolveOutDir('service-worker.js'),
        globDirectory: api.resolveOutDir(),
        globPatterns: [
          '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf,otf}',
        ].concat(generateSWOptions.globPatterns || []),
      })

      await generateManifest(api, {
        name,
        themeColor,
        manifest,
      })
    })

    const { publicUrl } = api.config.build
    const assetsVersionStr = assetsVersion ? `?v=${assetsVersion}` : ''

    api.hooks.getDocumentData.tap(ID, (data) => {
      const appleTouchIcons = appleTouchIcon
        ? [{ src: appleTouchIcon }]
        : manifest.icons
      data.meta += [
        createElement('link', {
          rel: 'manifest',
          href: `${publicUrl}manifest.json${assetsVersionStr}`,
        }),
        createElement('meta', {
          name: 'theme-color',
          content: themeColor,
        }),
      ]
        .concat(
          appleTouchIcons
            ? appleTouchIcons.map(icon =>
              createElement('link', {
                rel: 'apple-touch-icon',
                sizes: icon.sizes || false,
                href: icon.src,
              }),
            )
            : [],
        )
        .filter(Boolean)
        .join('')
      return data
    })
  }
}
