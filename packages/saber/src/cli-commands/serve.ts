import { setNodeEnv, handleError } from './utils'
import { createSaber } from '..'

export default function(cli: any) {
  cli
    .command('serve [app-path]', 'Serve the output directory')
    .option('--host <host>', 'Server host', { default: '0.0.0.0' })
    .option('--port <port>', 'Server port', { default: 3000 })
    .action(
      handleError((cwd = '.', options: any) => {
        setNodeEnv('production')

        const { host, port } = options
        delete options.host
        delete options.port
        return createSaber(Object.assign({ cwd, dev: true }, options), {
            server: {
              host,
              port
            }
          })
          .serveOutDir()
      })
    )
}
