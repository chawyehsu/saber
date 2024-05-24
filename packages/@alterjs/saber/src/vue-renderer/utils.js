const fs = require('node:fs')

exports.prefixSpace = input => (input ? ` ${input}` : '')

exports.readJSON = (file, readFile = fs.readFileSync) =>
  JSON.parse(readFile(file, 'utf8'))
