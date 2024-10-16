// @ts-check
import { URL } from 'node:url'

/**
 * Get feed path
 * @param {string|boolean|undefined} feedPath
 * @param {string} defaultPath
 */
export function getFeedPath(feedPath, defaultPath) {
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
export function resolveURL(base, pathname) {
  return new URL(pathname, base).href
}
