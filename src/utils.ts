import { gray, green, isColorSupported, magenta, yellow } from 'colorette'

import { logLevelStringToLogLevelMap, logLevelToChalkColorMap } from './constants'
import type { Log, LogLevelString } from './types'
import { LogLevel } from './types'

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
  if (typeof err === 'object') {
    if ('message' in err) {
      return true
    }
  }

  return false
}

export function newLog(logLevel: LogLevelString, context: string, fields: Record<string, any>, message: string, ...optionalParams: [...any, string?]): Log {
  let fieldsObj: { context?: string, [key: string]: any } = { context: '' }

  if (typeof fields !== 'undefined' && fields !== null) {
    fieldsObj = { ...fields }
  }
  if (typeof context !== 'undefined' && context !== null) {
    fieldsObj.context = context
  }

  let messageString = ''
  if (optionalParams != null && optionalParams.length > 0) {
    // eslint-disable-next-line ts/no-unsafe-assignment
    messageString = [message, ...optionalParams].join(' ')
  }
  else {
    messageString = message
  }

  const raw: Log = {
    '@timestamp': new Date().toISOString(),
    'level': logLevel,
    'fields': fieldsObj,
    'message': messageString,
  }

  return raw
}

export function newErrorLog(logLevel: LogLevelString, context: string, fields: Record<string, any>, message: string, errorStack?: string, ...optionalParams: [...any, string?]): Log {
  // eslint-disable-next-line ts/no-unsafe-argument
  const log = newLog(logLevel, context, fields, message, ...optionalParams)
  if (typeof errorStack !== 'undefined' && errorStack !== null) {
    log.errored = true
    log.error = { stack: errorStack }
  }

  return log
}

export function toPrettyString(log: Log): string {
  // Disable colors if not supported
  if (!isColorSupported) {
    return JSON.stringify(log)
  }

  const messagePartials: string[] = []

  messagePartials.push(log['@timestamp'])
  messagePartials.push(
    logLevelToChalkColorMap[logLevelStringToLogLevelMap[log.level]](
      `[${log.level}]`,
    ),
  )

  let contextString = ''
  if (log.fields.isNestSystemModule != null) {
    contextString = magenta(`[${log.fields.nestSystemModule}]`)
    delete log.fields.isNestSystemModule
    delete log.fields.nestSystemModule
  }
  if (log.fields.context != null) {
    contextString = magenta(`[${log.fields.context}]`)
    delete log.fields.context
  }
  if (contextString.length > 0) {
    messagePartials.push(contextString)
  }
  if ('module' in log.fields && log.fields.module != null) {
    messagePartials.push(magenta(`[${log.fields.module}]`))
    delete log.fields.module
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
        valueString = value.message
      }
      if (!valueString) {
        valueString = ''
      }
      if (value.cause != null) {
        try {
          valueString += JSON.stringify(value.cause)
        }
        catch (err) {
          valueString += String(value.cause)
        }
      }
    }
    else {
      switch (typeof value) {
        case 'number':
          valueString = yellow(value)
          break
        case 'object':
          valueString = green(JSON.stringify(value))
          break
        case 'boolean':
          valueString = yellow(String(value))
          break
        case 'undefined':
          valueString = gray('undefined')
          break
        default:
          valueString = String(value)
          break
      }
    }

    messagePartials.push(`${gray(key)}${gray('=')}${valueString}`)
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
