import path from 'node:path'
import fs from 'fs-extra'
import { slash } from './utils'
import type { Saber } from '.'

export class BrowserApi extends Set<string> {
  api: Saber

  constructor(api: Saber) {
    super()
    this.api = api
  }

  /**
   * Register a file that implements Saber's browser API
   */
  add(filepath: string) {
    super.add(filepath)
    return this
  }

  async reload() {
    const files = [...this.values()].map((file, i) => {
      const name = `_${path.basename(file).replace(/\W/g, '_')}_${i}`
      return {
        name,
        path: slash(file),
      }
    })

    const output = `
      ${files
        .map(file => `var ${file.name} = require("${file.path}").default`)
        .join('\n')}

      var themeBrowserApi
      var rTheme = require.context('#theme', false, /\\.\\/saber-browser\\.[jt]s$/)
      rTheme.keys().forEach(function (k) {
        themeBrowserApi = rTheme(k).default
      })

      export default function (context) {
        ${files
          .map(
            file =>
              `typeof ${file.name} === 'function' && ${file.name}(context)`,
          )
          .join('\n')}
        typeof themeBrowserApi === 'function' && themeBrowserApi(context)
      }`

    await fs.outputFile(
      this.api.resolveCache('extend-browser-api.js'),
      output,
      'utf8',
    )
  }
}
