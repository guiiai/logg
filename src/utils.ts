import pc from 'picocolors'
import { format } from 'date-fns'
import { DEFAULT_TIME_FORMAT, logLevelStringToLogLevelMap, logLevelToColorMap } from './constants'
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

export function newLog(
  logLevel: LogLevelString,
  context: string,
  fields: Record<string, any>,
  message: string,
  timeFormat: string = DEFAULT_TIME_FORMAT,
  ...optionalParams: [...any, string?]
): Log {
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
    // eslint-disable-next-line ts/no-unsafe-assignment, ts/no-unsafe-call
    '@localetime': format(new Date(), timeFormat),
    'level': logLevel,
    'fields': fieldsObj,
    'message': messageString,
  }

  return raw
}

export function newErrorLog(
  logLevel: LogLevelString,
  context: string,
  fields: Record<string, any>,
  message: string,
  errorStack?: string,
  timeFormat: string = DEFAULT_TIME_FORMAT,
  ...optionalParams: [...any, string?]
): Log {
  // eslint-disable-next-line ts/no-unsafe-argument
  const log = newLog(logLevel, context, fields, message, timeFormat, ...optionalParams)
  if (typeof errorStack !== 'undefined' && errorStack !== null) {
    log.errored = true
    log.error = { stack: errorStack }
  }

  return log
}

export function toPrettyString(log: Log): string {
  const messagePartials: string[] = []

  messagePartials.push(log['@localetime'])
  messagePartials.push(
    logLevelToColorMap[logLevelStringToLogLevelMap[log.level]](
      `[${log.level}]`,
    ),
  )

  let contextString = ''
  if (log.fields.isNestSystemModule != null) {
    contextString = pc.magenta(`[${log.fields.nestSystemModule}]`)
    delete log.fields.isNestSystemModule
    delete log.fields.nestSystemModule
  }
  if (log.fields.context != null) {
    contextString = pc.magenta(`[${log.fields.context}]`)
    delete log.fields.context
  }
  if (contextString.length > 0) {
    messagePartials.push(contextString)
  }
  if ('module' in log.fields && log.fields.module != null) {
    messagePartials.push(pc.magenta(`[${log.fields.module}]`))
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
