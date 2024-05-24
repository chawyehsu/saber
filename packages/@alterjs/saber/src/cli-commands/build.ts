import { log } from '../utils'
import { createSaber } from '..'
import { handleError, setNodeEnv } from './utils'

export default function (cli: any) {
  cli
    .command(
      'build [app-path]',
      'Compile the application and generate static HTML files',
      {
        ignoreOptionDefaultValue: true,
      },
    )
    .alias('generate')
    .option('--skip-compilation', 'Skip the webpack compilation process')
    .option('--inspect-webpack', 'Inspect webpack config in your editor')
    .option('--no-cache', 'Disable cache')
    .action(
      handleError((cwd = '.', options: any) => {
        setNodeEnv('production')

        if (cli.matchedCommandName === 'generate') {
          log.warn(
            `The "generate" command is now deprecated, please use "build" instead.`,
          )
        }

        const { skipCompilation, cache } = options
        delete options.skipCompilation
        delete options.cache

        return createSaber(Object.assign({ cwd, dev: false }, options), {
          build: {
            cache,
          },
        })
          .build({ skipCompilation })
      }),
    )
}
