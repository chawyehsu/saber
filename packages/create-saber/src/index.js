#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import colors from 'kleur'

const args = process.argv.slice(2)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createSite() {
  if (
    args.length === 0
    || ['-h', '--help'].some(helpFlag => args.includes(helpFlag))
  ) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json')))

    console.log(
      `create-saber v${pkg.version}

  Usage: create-saber <dir>
    `.trim(),
    )
    process.exit(1)
  }

  if (args.some(arg => arg.startsWith('-'))) {
    console.log(`Invalid flag ${args.join('')}`)
    process.exit(1)
  }

  if (Number.parseInt(process.versions.node, 10) < 18) {
    console.log(
      `Node.js ${process.versions.node} isn't supported, you need Node.js 18 or above.`,
    )
    process.exit(1)
  }

  const dir = path.resolve(args[0])

  console.log(`Creating a new site...`)

  let hasYarn = false
  try {
    spawnSync('yarn', ['--version'])
    hasYarn = true
  } catch (error) {}

  fs.promises.cp(path.join(__dirname, '../', 'template'), dir, { recursive: true })
    .then(() => {
      console.log(
        colors.green(`Successfully created at ${colors.underline(dir)}`),
      )
      console.log(colors.bold(`To start dev server, run:`))
      console.log(colors.cyan(`$ cd ${path.relative(process.cwd(), dir)}`))
      if (hasYarn) {
        console.log(colors.cyan(`$ yarn`))
        console.log(colors.cyan(`$ yarn dev`))
      } else {
        console.log(colors.cyan(`$ npm install`))
        console.log(colors.cyan(`$ npm run dev`))
      }

      console.log(colors.dim(`For more details, please check out the README.md`))
    })
    .catch(console.error)
}

createSite()
