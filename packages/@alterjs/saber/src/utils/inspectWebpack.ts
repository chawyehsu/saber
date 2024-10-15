import { inspect } from 'node:util'
import { log } from './log'
import type { Configuration } from 'webpack'

/**
 * Inspect webpack config in your default editor
 * @param {Configuration} config Webpack configuration
 * @param {string} type
 */
export default async (config: Configuration, type: string) => {
  log.info(`webpack-${type}: ${inspect(config)}`)
}
