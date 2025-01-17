import { AsyncSeriesHook, SyncHook, SyncWaterfallHook } from 'tapable'
import type Config from 'webpack-chain'
import type { BundleRenderer } from 'vue-server-renderer'
import type { Configuration } from 'webpack'
import type ConfigChain from './config-chain'
import type { ResolvedSaberPlugin, WebpackContext } from '.'

export const hooks = {
  // Before all user plugins have been applied
  beforePlugins: new AsyncSeriesHook(),
  filterPlugins: new SyncWaterfallHook<[ResolvedSaberPlugin[]]>(['plugins']),
  // After all user plugins have been applied
  afterPlugins: new AsyncSeriesHook(),
  // Before running the build process
  beforeRun: new AsyncSeriesHook(),
  onUpdateConfigFile: new AsyncSeriesHook(),

  /**
   * Extended webpack config
   */
  chainWebpack: new SyncHook<[Config, WebpackContext]>(['webpackChain', 'opts']),
  getWebpackConfig: new SyncWaterfallHook<[Configuration, WebpackContext]>(['config', 'opts']),
  /**
   * Extend markdown-it config in a chainable way
   *
   * Use this hook to extend `markdown-it` config
   */
  chainMarkdown: new SyncHook<ConfigChain>(['config']),
  chainTemplate: new SyncHook<ConfigChain>(['config']),
  emitRoutes: new AsyncSeriesHook(),
  // Called after running webpack
  afterBuild: new AsyncSeriesHook(),
  // Called after generate static HTML files
  afterGenerate: new AsyncSeriesHook(),
  getDocumentData: new SyncWaterfallHook<[string, string]>(['documentData', 'ssrContext']),
  getDocument: new SyncWaterfallHook<[string, string]>(['document', 'ssrContext']),
  defineVariables: new SyncWaterfallHook<any>(['variables']),
  // Called before creating pages for the first time
  initPages: new AsyncSeriesHook(),
  // Called when a new page is added
  onCreatePage: new AsyncSeriesHook(['page']),
  // Called when all pages are added to our `source`
  onCreatePages: new AsyncSeriesHook(),
  // Emit pages as .saberpage files when necessary
  emitPages: new AsyncSeriesHook(),
  // Call this hook to manipulate a page, it's usually used by file watcher
  manipulatePage: new AsyncSeriesHook<any>(['data']),
  // Call when server renderer is created and updated
  onCreateRenderer: new AsyncSeriesHook<[BundleRenderer | undefined, boolean]>(['renderer', 'isFirstTime']),
  // Called before exporting a page as static HTML file
  beforeExportPage: new AsyncSeriesHook<[any, any]>(['context', 'exportedPage']),
  // Called after exporting a page
  afterExportPage: new AsyncSeriesHook<[any, any]>(['context', 'exportedPage']),

  /**
   * Called after creating the server
   */
  onCreateServer: new SyncHook(['server']),
}
