import path from 'node:path'
import { createReadStream } from 'node:fs'
import polka from 'polka'
import serveStatic from 'serve-static'
import { log } from './log'

interface Options {
  dir: string
  host: string
  port: number
}

/**
 * Start a static file server with given options.
 * @param options Options
 */
export default function (options: Options) {
  const { dir, host, port } = options
  const server = polka()
  server.use(serveStatic(dir))
  server.use((req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }
    createReadStream(path.join(dir, '404.html')).pipe(res)
  })
  server.listen(port, host)
  const outputHost = host === '0.0.0.0' ? 'localhost' : host
  log.info(`Your application is served at http://${outputHost}:${port}`)
}
