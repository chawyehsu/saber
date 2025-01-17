const fs = require('node:fs')
const path = require('node:path')

const filesToCopy = ['saber-browser.js', 'styles.module.css']

for (const file of filesToCopy) {
  const SRC = path.join(__dirname, `../src/${file}`)
  const DST = path.join(__dirname, `../dist/${file}`)
  fs.copyFileSync(SRC, DST)
}
