import { getGlobalFormat } from '../logger'
import { Format } from '../types'
import { isBrowser } from './browser'

export function shouldUseHyperlink() {
  return !isBrowser() && getGlobalFormat() === Format.Pretty
}

export function withHyperlink(basePath: string, context: string) {
  return shouldUseHyperlink() ? `\x1B]8;;file://${basePath}\x1B\\${context}\x1B]8;;\x1B\\` : context
}
