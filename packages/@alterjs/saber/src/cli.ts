#!/usr/bin/env node
import process from 'node:process'
import type { CAC } from 'cac'
import { cac } from 'cac'
import { log } from './utils'
import commands from './cli-commands'

function isSupported() {
  const [major] = process.versions.node.split('.', 1).map(Number)
  return major >= 16
}

export function start() {
  if (!isSupported()) {
    log.error(
      `Saber requires Node.js >= 16 to work currently, your current Node.js version is ${process.versions.node}.`,
    )
    process.exit(1)
  }

  const cli: CAC = cac()
  commands(cli)

  cli.option('-V, --verbose', 'Output verbose logs')
  cli.option('--no-progress', 'Disable progress bar')

  cli.version(require('../package').version)

  cli.help()

  cli.parse()

  process.on('SIGINT', () => {
    log.log('')
    log.info(`See you later, master!`) // <-- Saber says
    process.exit()
  })

  process.on('unhandledRejection', (error: any) => {
    log.error(error.stack)
    process.exitCode = 1
  })
}
