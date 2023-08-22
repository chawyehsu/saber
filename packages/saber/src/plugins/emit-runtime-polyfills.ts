import { fs, slash } from 'saber-utils'
import { SaberPlugin } from '..'

const ID = 'builtin:emit-runtime-polyfills'

let previousPolyfills: string | undefined

const emitRuntimePolyfillsPlugin: SaberPlugin = {
  name: ID,
  apply: api => {
    api.hooks.afterPlugins.tap(ID, () => {
      api.hooks.emitRoutes.tapPromise(ID, async () => {
        const polyfills = [...api.runtimePolyfills]
          .map(file => `import '${slash(file)}'`)
          .join('\n')
        if (polyfills !== previousPolyfills) {
          await fs.outputFile(
            api.resolveCache('runtime-polyfills.js'),
            polyfills,
            'utf8'
          )
          // eslint-disable-next-line require-atomic-updates
          previousPolyfills = polyfills
        }
      })
    })
  }
}

export default emitRuntimePolyfillsPlugin
