// @ts-expect-error - no types
import ChainedMap from 'webpack-chain/src/ChainedMap'
// @ts-expect-error - no types
import Orderable from 'webpack-chain/src/Orderable'

export default Orderable(
  class Plugin extends ChainedMap {
    [x: string]: any

    constructor(parent: any) {
      super(parent)
      this.extend(['init'])

      this.init((plugin: any, args = []) => ({ plugin, args }))
    }

    use(plugin: any, args = []) {
      return this.set('plugin', plugin).set('args', args)
    }

    tap(f: any) {
      this.set('args', f(this.get('args') || []))
      return this
    }

    merge(obj: any, omit = []) {
      if ('plugin' in obj) {
        this.set('plugin', obj.plugin)
      }

      if ('args' in obj) {
        this.set('args', obj.args)
      }

      return super.merge(obj, [...omit, 'args', 'plugin'])
    }

    toConfig() {
      const init = this.get('init')

      return init(this.get('plugin'), this.get('args'))
    }
  },
)
