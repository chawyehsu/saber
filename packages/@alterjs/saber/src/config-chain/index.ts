/**
 * Modified: https://github.com/ulivz/markdown-it-chain/blob/master/src/index.js
 */
// @ts-expect-error - no types
import ChainedMap from 'rspack-chain/src/ChainedMap'
import resolvePackage from '../utils/resolvePackage'
import Plugin from './Plugin'
import Options from './Options'

export default class ConfigChain extends ChainedMap {
  [x: string]: any

  constructor() {
    super()
    this.options = new Options(this)
    this.plugins = new ChainedMap(this)
  }

  toConfig() {
    return this.clean(
      Object.assign(this.entries() || {}, {
        options: this.options.entries(),
        plugins: this.plugins.values().map((plugin: any) => plugin.toConfig()),
      }),
    )
  }

  plugin(name: any) {
    if (!this.plugins.has(name)) {
      this.plugins.set(name, new Plugin(this))
    }

    return this.plugins.get(name)
  }

  loadPlugins(rawPluginList: any, cwd: any) {
    const pluginList = rawPluginList.map((plugin: any) => {
      if (typeof plugin === 'string') {
        plugin = { resolve: plugin }
      }

      plugin.resolve = resolvePackage(plugin.resolve, { cwd })
      plugin.name = plugin.name || plugin.resolve
      plugin.handler = require(plugin.resolve)

      return plugin
    })

    for (const plugin of pluginList) {
      this.plugin(plugin.name).use(
        plugin.handler,
        Array.isArray(plugin.options) ? plugin.options : [plugin.options],
      )
    }
  }
}
