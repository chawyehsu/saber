const fs = require('node:fs')
const path = require('node:path')

const SRC = path.join(__dirname, '../src/pug-plain-loader.js')
const DST = path.join(__dirname, '../dist/pug-plain-loader.js')

fs.copyFileSync(SRC, DST)
