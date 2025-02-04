import process from 'node:process'

let enabled
  = process.env.FORCE_COLOR
  || process.platform === 'win32'
  || (process.stdout
  && process.stdout.isTTY
  && process.env.TERM
  && process.env.TERM !== 'dumb')

function rawInit(open: string, close: string, searchRegex: RegExp, replaceValue: string) {
  return (s: string) =>
    enabled
      ? open
      + (~(s).indexOf(close, 4) // skip opening \x1b[
        ? s.replace(searchRegex, replaceValue)
        : s)
        + close
      : s
}

function init(open: number, close: number) {
  return rawInit(
    `\x1B[${open}m`,
    `\x1B[${close}m`,
    new RegExp(`\\x1b\\[${close}m`, 'g'),
    `\x1B[${open}m`,
  )
}

export const colors = {
  options: Object.defineProperty({}, 'enabled', {
    get: () => enabled,
    set: value => (enabled = value),
  }),
  reset: init(0, 0),
  bold: rawInit('\x1B[1m', '\x1B[22m', /\\x1B\[22m/g, '\x1B[22m\x1B[1m'),
  dim: rawInit('\x1B[2m', '\x1B[22m', /\\x1B\[22m/g, '\x1B[22m\x1B[2m'),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49),
}
