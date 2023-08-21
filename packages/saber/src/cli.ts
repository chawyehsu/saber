#!/usr/bin/env node
import { cac } from 'cac'
import { log } from 'saber-log'
import commands from './cli-commands'

const cli = cac()
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
