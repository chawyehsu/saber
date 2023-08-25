import configLoader from './configLoader'
import inspectWebpack from './inspectWebpack'
import serveDir from './serveDir'
import fs from 'fs-extra'
import glob from 'fast-glob'

/**
 * Convert back slash to slash
 */
function slash(input: string) { return input && input.replace(/\\/g, '/') }

const publicUtils = {
  fs,
  slash,
  glob,
}

export {
  configLoader,
  inspectWebpack,
  slash,
  serveDir,
  publicUtils
}
