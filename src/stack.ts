export interface ParsedValidErrorStack {
  invalid: false
  function: string
  file: string
  line: number
  column: number
}

export interface ParsedInvalidErrorStack {
  invalid: true
}

export type ParsedErrorStack = ParsedValidErrorStack | ParsedInvalidErrorStack

export function parseErrorStacks(errorLike: { stack?: string }): ParsedErrorStack[] {
  if (errorLike.stack == null) {
    return []
  }

  return errorLike.stack
    .split('\n')
    .map(item => item.trim())
    .slice(1)
    .filter((item) => {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const match = /^at (.*)( \(.*:(\d+):(\d+)\))|at (.*)(:(\d+):(\d+))/i.exec(item)
      if (!match)
        return false

      return true
    })
    .map((item) => {
      const match = /at (.*)( \((.*):(\d+):(\d+)\))|at (.*)(:(\d+):(\d+))/i.exec(item)
      if (!match) {
        return {
          invalid: true,
        } as ParsedInvalidErrorStack
      }

      if (typeof match[1] !== 'undefined'
        && typeof match[2] !== 'undefined'
        && typeof match[3] !== 'undefined'
        && typeof match[4] !== 'undefined'
        && typeof match[5] !== 'undefined'
      ) {
        return {
          invalid: false,
          function: match[1] ?? '',
          file: match[3] ?? '',
          line: Number.parseInt(match[4] ?? '0'),
          column: Number.parseInt(match[5] ?? '0'),
        } as ParsedValidErrorStack
      }
      else if (typeof match[6] !== 'undefined'
        && typeof match[7] !== 'undefined'
        && typeof match[8] !== 'undefined'
        && typeof match[9] !== 'undefined'
      ) {
        return {
          invalid: false,
          function: match[6] ?? '',
          file: match[7] ?? '',
          line: Number.parseInt(match[8] ?? '0'),
          column: Number.parseInt(match[9] ?? '0'),
        } as ParsedValidErrorStack
      }
      else {
        return {
          invalid: true,
        } as ParsedInvalidErrorStack
      }
    })
}
