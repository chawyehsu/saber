import path from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import JoyCon from 'joycon'

export const CONFIG_FILES = [
  'saber-config.json',
  'saber-config.js',
  'saber-config.yml',
  'saber-config.toml',
]

const joycon = new JoyCon({
  stopDir: path.dirname(process.cwd()),
})

joycon.addLoader({
  test: /\.ya?ml$/,
  loadSync: filepath =>
    require('./yaml.min').safeLoad(fs.readFileSync(filepath, 'utf8')),
})

joycon.addLoader({
  test: /\.toml$/,
  loadSync: filepath =>
    require('./toml.min').parse(fs.readFileSync(filepath, 'utf8')),
})

export default {
  /**
   * Load config files synchronously
   * @param {import('joycon').Options} opts
   */
  load(opts: any) {
    joycon.clearCache()
    return joycon.loadSync(opts)
  },
  /**
   * Resolve config files synchronously
   * @param {import('joycon').Options} opts
   */
  resolve(opts: any) {
    joycon.clearCache()
    return joycon.resolveSync(opts)
  },

  CONFIG_FILES,
}
