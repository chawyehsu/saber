import fs from 'node:fs'
import path from 'node:path'
import { log, colors } from '../utils/log'
import { SaberPlugin } from '..'
import { hooks } from '../hooks'

const ID = 'builtin:extend-node-api'

function __noopHandler__(arg: any) {
  return arg
}

type HookName = keyof typeof hooks

const extendNodeApiPlugin: SaberPlugin = {
  name: ID,
  apply: api => {
    const handleNodeApiFile = (nodeApiFile: string, nodeApiId: string) => {
      let nodeApi: any = {}

      const updateNodeApi = () => {
        if (fs.existsSync(nodeApiFile)) {
          delete require.cache[nodeApiFile]
          nodeApi = require(nodeApiFile)
        } else {
          nodeApi = {}
        }
      }

      updateNodeApi()

      const getHookHandler = (hookName: HookName) => nodeApi[hookName] || __noopHandler__
      const addHook = (hookName: HookName) => {
        const hook = api.hooks[hookName]
        if (hook) {
          // @ts-ignore
          const tapType = hook.call ? 'tap' : 'tapPromise'
          hook[tapType](nodeApiId, (...args) => {
            const hookHandler = getHookHandler(hookName)
            if (hookHandler.name !== '__noopHandler__') {
              log.verbose(() => `${hookName} ${colors.dim(`(${nodeApiId})`)}`)
            }

            if (tapType === 'tap') {
              return hookHandler.call(api, ...args)
            }

            return Promise.resolve(hookHandler.call(api, ...args))
          })
        }
      }

      // Hooks that should be added before `afterPlugins` hook
      const preHooks = ['beforePlugins', 'filterPlugins']

      for (const preHook of preHooks) {
        addHook(preHook as HookName)
      }

      api.hooks.afterPlugins.tap(nodeApiId, () => {
        for (const hookName of Object.keys(api.hooks)) {
          if (preHooks.includes(hookName)) {
            continue
          }

          addHook(hookName as HookName)
        }
      })

      if (api.dev && !nodeApiFile.includes('node_modules')) {
        const onChange = async (action: any) => {
          updateNodeApi()
          // Remove all child pages
          api.pages.removeWhere(page => !!page.internal.parent)
          await Promise.all(
            [...api.pages.values()].map(async page => {
              // Recreate the page
              api.pages.createPage(page)
              // A page has been created
              await api.hooks.onCreatePage.promise(page)
            })
          )
          // All pages are created
          await api.hooks.onCreatePages.promise()
          // Emit pages
          await api.hooks.emitPages.promise()
          // Emit route file
          await api.hooks.emitRoutes.promise()
          log.warn(
            `${action[0].toUpperCase()}${action.substring(1)} ${nodeApiFile}`
          )
          // Because you might also update webpack config in saber-node.js
          // Which we can't (?) automatically reload
          log.warn(`You probably need to restart the server.`)
        }
        require('chokidar')
          .watch(nodeApiFile, {
            ignoreInitial: true
          })
          .on('all', (action: any) => {
            onChange(action)
          })
      }
    }

    handleNodeApiFile(path.join(api.theme, 'saber-node.js'), 'theme-node-api')
    handleNodeApiFile(api.resolveCwd('saber-node.js'), 'user-node-api')
  }
}

export default extendNodeApiPlugin
