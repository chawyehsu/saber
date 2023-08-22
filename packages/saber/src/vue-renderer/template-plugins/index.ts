import { Saber } from '../..'
import ConfigChain from '../../config-chain'

export default function (api: Saber) {
  const chain = new ConfigChain()
  const template = api.config.template

  const builtInPlugins = [
    {
      name: 'link',
      resolve: require.resolve('./link'),
      options: {
        openLinkInNewTab:
          typeof template.openLinkInNewTab === 'boolean'
            ? template.openLinkInNewTab
            : true
      }
    }
  ]

  // Load built-in plugins
  chain.loadPlugins(builtInPlugins, api.configDir)

  api.hooks.chainTemplate.call(chain)

  // Load plugins from config file
  if (template.plugins) {
    chain.loadPlugins(template.plugins, api.configDir)
  }

  const { plugins } = chain.toConfig()

  return plugins.map((plugin: any) => (tree: any, context: any) => {
    const transform = plugin.plugin(...plugin.args)
    return transform(tree, context)
  })
}
