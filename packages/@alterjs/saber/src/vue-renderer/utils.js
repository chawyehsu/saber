const fs = require('node:fs')

exports.prefixSpace = input => (input ? ` ${input}` : '')

/**
 *
 * @param {fs.PathOrFileDescriptor} file
 * @param {fs.readFileSync} readFile
 */
exports.readJSON = (file, readFile = fs.readFileSync) =>
  JSON.parse(readFile(file, 'utf8'))
