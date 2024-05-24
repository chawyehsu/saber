import { spawn as spawnProcess } from 'node:child_process'
import process from 'node:process'
import { log } from '../utils'

export function setNodeEnv(env: string) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = env
  }
}

export function handleError(fn: Function) {
  return async (...args: any[]) => {
    try {
      await fn(...args)
    } catch (error: any) {
      const message = typeof error === 'string' ? error : error.stack
      log.error(message)
      process.exit(1)
    }
  }
}

export function spawn(command: string, ...args: any[]) {
  return new Promise((resolve, reject) => {
    const childProcess = spawnProcess(command, ...args)
    childProcess.on('close', resolve)
    childProcess.on('error', reject)
  })
}
