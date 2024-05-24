import { spawn as spawnProcess } from 'node:child_process'
import process from 'node:process'
import { log } from '../utils'

export function setNodeEnv(env) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = env
  }
}

export function handleError(fn) {
  return async (...args) => {
    try {
      await fn(...args)
    } catch (error) {
      const message = typeof error === 'string' ? error : error.stack
      log.error(message)
      process.exit(1)
    }
  }
}

export function spawn(...args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawnProcess(...args)
    childProcess.on('close', resolve)
    childProcess.on('error', reject)
  })
}
