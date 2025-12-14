import type { Log, LogLevelString } from './types'

import { logLevelStringToLogLevelMap, logLevelToColorMap } from './constants'
import { LogLevel } from './types'
import pc from './utils/picocolors'

export interface ErrorLike {
  message: string
  stack?: string
  cause?: any
}

export function isErrorLike(err: unknown): err is ErrorLike {
  if (err == null) {
    return false
  }
  if (err instanceof Error) {
    return true
  }

  return false
}

export function newLog(
  logLevel: LogLevelString,
  context: string,
  fields: Record<string, any>,
  message: string,
  timeFormatter?: (date: Date) => string,
): Log {
  let fieldsObj: { [key: string]: any } = {}

  if (typeof fields !== 'undefined' && fields !== null) {
    fieldsObj = { ...fields }
  }

  const now = new Date()

  const raw: Log = {
    '@timestamp': now.getTime(),
    '@localetime': timeFormatter ? timeFormatter(now) : now.toISOString(),
    'level': logLevel,
    'context': context,
    'fields': fieldsObj,
    'message': message,
  }

  return raw
}

export function newErrorLog(
  logLevel: LogLevelString,
  context: string,
  fields: Record<string, any>,
  message: string,
  errorStack?: string,
  timeFormatter?: (date: Date) => string,
): Log {
  const log = newLog(logLevel, context, fields, message, timeFormatter)
  if (typeof errorStack !== 'undefined' && errorStack !== null) {
    log.errored = true
    log.error = { stack: errorStack }
  }

  return log
}

function prettyFormatValue(value: any): string {
  let valueString = ''

  switch (typeof value) {
    case 'number':
      valueString = pc.yellow(value)
      break
    case 'object':
      valueString = pc.green(JSON.stringify(value))
      break
    case 'boolean':
      valueString = pc.yellow(String(value))
      break
    case 'undefined':
      valueString = pc.gray('undefined')
      break
    default:
      valueString = String(value)
      break
  }

  return valueString
}

export function toPrettyString(log: Log): string {
  const messagePartials: string[] = []

  messagePartials.push(log['@localetime'])
  messagePartials.push(
    logLevelToColorMap[logLevelStringToLogLevelMap[log.level]](
      `[${log.level}]`,
    ),
  )

  if (log.context.length > 0) {
    messagePartials.push(pc.magenta(`[${log.context}]`))
  }

  messagePartials.push(log.message)

  const fieldsEntries = Object.entries(log.fields)
  if (fieldsEntries.length > 0) {
    messagePartials.push(' {')
  }

  for (const [key, value] of fieldsEntries) {
    let valueString: string = value as string
    if (isErrorLike(value)) {
      if (value.message) {
        valueString = prettyFormatValue(value.message)
      }
      if (!valueString) {
        valueString = ''
      }
      if (value.cause != null) {
        try {
          valueString += JSON.stringify(value.cause)
        }
        catch {
          valueString += String(value.cause)
        }
      }
    }
    else {
      valueString = prettyFormatValue(value)
    }

    messagePartials.push(`${pc.gray(key)}${pc.gray('=')}${valueString}`)
  }

  if (fieldsEntries.length > 0) {
    messagePartials.push('}')
  }

  let message = messagePartials.join(' ')
  if (log.errored != null && log.errored && log.error && log.error.stack != null && log.error.stack) {
    message += `\n${log.error.stack}`
  }

  return message
}

export function shouldOutputDebugLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean {
  return logLevel >= LogLevel.Debug
}

export function shouldOutputVerboseLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean {
  return logLevel >= LogLevel.Verbose
}

export function shouldOutputLogLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean {
  return logLevel >= LogLevel.Log
}

export function shouldOutputWarningLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean {
  return logLevel >= LogLevel.Warning
}

export function shouldOutputErrorLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean {
  return logLevel >= LogLevel.Error
}
