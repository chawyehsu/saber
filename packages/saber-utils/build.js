const path = require('path')
const fs = require('fs-extra')

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

async function main() {
  const entry = path.join(__dirname, 'index.js')

  const res = await require('@vercel/ncc')(path.normalize(entry), {
    minify: true,
    sourceMap: false,
    watch: false
  })

  await fs.outputFile(
    path.join(__dirname, 'dist', path.basename(entry)),
    res.code,
    'utf8'
  )
}
