import { URL } from 'node:url'

/**
 * Get feed path
 * @param {string} defaultPath
 * @param {string|boolean|undefined} feedPath
 */
export function getFeedPath(defaultPath: string, feedPath?: string | boolean) {
  if (feedPath === true) {
    return defaultPath
  }

  if (typeof feedPath === 'string') {
    return feedPath
  }

  return null
}

/**
 * Resolve URL
 * @param {string} base
 * @param {string} pathname
 * @returns {string} Resolved URL
 */
export function resolveURL(base: string, pathname: string): string {
  return new URL(pathname, base).href
}
