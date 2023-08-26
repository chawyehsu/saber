import configLoader from './configLoader'
import inspectWebpack from './inspectWebpack'
import serveDir from './serveDir'
import fs from 'fs-extra'
import glob from 'fast-glob'
import { log } from './log'

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
  log,
  slash,
  serveDir,
  publicUtils
}
