import fs from 'fs-extra'
import glob from 'fast-glob'
import isAbsoluteUrl from 'is-absolute-url'

/**
 * Convert back slash to slash
 */
function slash(input) { return input && input.replace(/\\/g, '/') }

export { fs, glob, isAbsoluteUrl, slash }
