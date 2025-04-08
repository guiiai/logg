// https://www.npmjs.com/package/picocolors

export type Formatter = (input: string | number | null | undefined) => string

export interface Colors {
  isColorSupported: boolean
  reset: Formatter
  bold: Formatter
  dim: Formatter
  italic: Formatter
  underline: Formatter
  inverse: Formatter
  hidden: Formatter
  strikethrough: Formatter
  black: Formatter
  red: Formatter
  green: Formatter
  yellow: Formatter
  blue: Formatter
  magenta: Formatter
  cyan: Formatter
  white: Formatter
  gray: Formatter
  bgBlack: Formatter
  bgRed: Formatter
  bgGreen: Formatter
  bgYellow: Formatter
  bgBlue: Formatter
  bgMagenta: Formatter
  bgCyan: Formatter
  bgWhite: Formatter
}

const isColorSupported = true

function formatter(open: string, close: string, replace: string = open) {
  return (input: string | number | null | undefined) => {
    const string = `${input}`
    const index = string.indexOf(close, open.length)
    return ~index
      ? open + replaceClose(string, close, replace, index) + close
      : open + string + close
  }
}

function replaceClose(string: string, close: string, replace: string, index: number): string {
  const start = string.substring(0, index) + replace
  const end = string.substring(index + close.length)
  const nextIndex = end.indexOf(close)
  return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end
}

export function createColors(enabled = isColorSupported): Colors {
  return {
    isColorSupported: enabled,
    reset: enabled ? s => `\x1B[0m${s}\x1B[0m` : String,
    bold: enabled ? formatter('\x1B[1m', '\x1B[22m', '\x1B[22m\x1B[1m') : String,
    dim: enabled ? formatter('\x1B[2m', '\x1B[22m', '\x1B[22m\x1B[2m') : String,
    italic: enabled ? formatter('\x1B[3m', '\x1B[23m') : String,
    underline: enabled ? formatter('\x1B[4m', '\x1B[24m') : String,
    inverse: enabled ? formatter('\x1B[7m', '\x1B[27m') : String,
    hidden: enabled ? formatter('\x1B[8m', '\x1B[28m') : String,
    strikethrough: enabled ? formatter('\x1B[9m', '\x1B[29m') : String,
    black: enabled ? formatter('\x1B[30m', '\x1B[39m') : String,
    red: enabled ? formatter('\x1B[31m', '\x1B[39m') : String,
    green: enabled ? formatter('\x1B[32m', '\x1B[39m') : String,
    yellow: enabled ? formatter('\x1B[33m', '\x1B[39m') : String,
    blue: enabled ? formatter('\x1B[34m', '\x1B[39m') : String,
    magenta: enabled ? formatter('\x1B[35m', '\x1B[39m') : String,
    cyan: enabled ? formatter('\x1B[36m', '\x1B[39m') : String,
    white: enabled ? formatter('\x1B[37m', '\x1B[39m') : String,
    gray: enabled ? formatter('\x1B[90m', '\x1B[39m') : String,
    bgBlack: enabled ? formatter('\x1B[40m', '\x1B[49m') : String,
    bgRed: enabled ? formatter('\x1B[41m', '\x1B[49m') : String,
    bgGreen: enabled ? formatter('\x1B[42m', '\x1B[49m') : String,
    bgYellow: enabled ? formatter('\x1B[43m', '\x1B[49m') : String,
    bgBlue: enabled ? formatter('\x1B[44m', '\x1B[49m') : String,
    bgMagenta: enabled ? formatter('\x1B[45m', '\x1B[49m') : String,
    bgCyan: enabled ? formatter('\x1B[46m', '\x1B[49m') : String,
    bgWhite: enabled ? formatter('\x1B[47m', '\x1B[49m') : String,
  }
}

export default createColors()
