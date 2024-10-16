const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '../src/saber-browser.js')
const DST = path.join(__dirname, '../dist/saber-browser.js')

fs.copyFileSync(SRC, DST)
