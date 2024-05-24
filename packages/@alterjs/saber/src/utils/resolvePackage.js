const path = require('node:path')
const process = require('node:process')
const resolveFrom = require('resolve-from')

const LOCAL_PATH_RE = /^[./]|(^[a-z]:)/i

/**
 * Add prefix to package name
 * @param {string} input
 * @param {string=} prefix
 */
function addPrefix(input, prefix) {
  if (!prefix) {
    return input
  }

  if (input.startsWith('@')) {
    return input.replace(new RegExp(`^@(\\w+)/(${prefix})?`), `@$1/${prefix}`)
  }

  return input.startsWith(prefix) ? input : `${prefix}${input}`
}

/**
 * @param {string} input
 * @param {object} options
 * @param {string|false} [options.cwd]
 * @param {string=} options.prefix
 */
module.exports = (input, { cwd = process.cwd(), prefix } = {}) => {
  if (LOCAL_PATH_RE.test(input)) {
    return cwd === false ? input : path.resolve(cwd, input)
  }

  input = addPrefix(input, prefix)

  if (cwd === false) {
    return input
  }

  return path.dirname(resolveFrom(cwd, `${input}/package.json`))
}
