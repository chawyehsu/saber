import dev from './dev'
import build from './build'
import serve from './serve'
import ejectTheme from './eject-theme'

export default function (cli: any) {
  dev(cli)
  build(cli)
  serve(cli)
  ejectTheme(cli)
}
