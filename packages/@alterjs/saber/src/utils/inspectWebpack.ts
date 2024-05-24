import { inspect } from 'node:util'
import { log } from './log'

/**
 * Inspect webpack config in your default editor
 * @param {import('webpack-chain')} config Webpack-chain instance
 * @param {string} type
 */
export default async (config: any, type: string) => {
  log.info(`webpack-${type}: ${inspect(config)}`)
}
