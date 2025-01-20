import fs from 'node:fs'

export function prefixSpace(input?: string): string {
  return input ? ` ${input}` : ''
}

export function readJSON(
  file: fs.PathOrFileDescriptor,
  readFile = fs.readFileSync,
) {
  return JSON.parse(readFile(file, 'utf8'))
}
