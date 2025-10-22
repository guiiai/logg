import { merge } from '@moeru/std'
import ErrorStackParser from 'error-stack-parser'
import path from 'pathe'

import {
  availableFormats,
  availableLogLevels,
  availableLogLevelStrings,
  logLevelStringToLogLevelMap,
  logLevelToLogLevelStringMap,
} from './constants'
import { parseErrorStacks } from './stack'
import { Format, LogLevel, LogLevelString } from './types'
import {
  isErrorLike,
  newErrorLog,
  newLog,
  shouldOutputDebugLevelLogWhenLogLevelIsOneOf,
  shouldOutputErrorLevelLogWhenLogLevelIsOneOf,
  shouldOutputLogLevelLogWhenLogLevelIsOneOf,
  shouldOutputVerboseLevelLogWhenLogLevelIsOneOf,
  shouldOutputWarningLevelLogWhenLogLevelIsOneOf,
  toPrettyString,
} from './utils'
import { isBrowser } from './utils/browser'
import { withHyperlink } from './utils/hyperlink'

const GLOBAL_CONFIG = {
  configured: false,
  logLevel: LogLevel.Debug,
  format: Format.JSON,
  timeFormatter: (inputDate: Date) => inputDate.toISOString(),
}

export function getGlobalLogLevel(): LogLevel {
  return GLOBAL_CONFIG.logLevel
}

export function setGlobalLogLevel(logLevel: LogLevel): void {
  if (availableLogLevels.includes(logLevel)) {
    GLOBAL_CONFIG.logLevel = logLevel
  }
  else {
    throw new Error(
      `log level ${logLevel} is not available. available log levels are: ${availableLogLevels.join(
        ', ',
      )}`,
    )
  }

  GLOBAL_CONFIG.configured = true
}

export function getGlobalLogLevelString(): LogLevelString {
  return logLevelToLogLevelStringMap[GLOBAL_CONFIG.logLevel]
}

export function setGlobalLogLevelString(logLevelString: LogLevelString): void {
  if (availableLogLevelStrings.includes(logLevelString)) {
    GLOBAL_CONFIG.logLevel = logLevelStringToLogLevelMap[logLevelString]
  }
  else {
    throw new Error(
      `log level ${logLevelString} is not available. available log levels are: ${availableLogLevelStrings.join(
        ', ',
      )}`,
    )
  }

  GLOBAL_CONFIG.configured = true
}

export function getGlobalFormat(): Format {
  return GLOBAL_CONFIG.format
}

export function setGlobalFormat(format: Format): void {
  if (availableFormats.includes(format)) {
    GLOBAL_CONFIG.format = format
  }
  else {
    throw new Error(
      `format ${format} is not available. available formats are: ${availableFormats.join(
        ', ',
      )}`,
    )
  }

  GLOBAL_CONFIG.configured = true
}

export function setGlobalTimeFormatter(fn: (inputDate: Date) => string): void {
  GLOBAL_CONFIG.timeFormatter = fn
  GLOBAL_CONFIG.configured = true
}

export function getGlobalTimeFormatter(): (inputDate: Date) => string {
  return GLOBAL_CONFIG.timeFormatter
}

export interface Logg {
  /**
   *
   * @returns Set the logger to use the global configuration.
   */
  useGlobalConfig: () => Logg
  /**
   * Create a child logger with additional fields.
   */
  child: (fields?: Record<string, any>) => Logg
  /**
   * Dynamically set the context. A copied clone of the logger is returned.
   *
   * @param context - The context to set, usually the name of the function or module.
   * @returns
   */
  withContext: (context: string) => Logg
  /**
   * Dynamically set the log level. A copied clone of the logger is returned.
   *
   * @param logLevel - The log level to set.
   * @returns
   */
  withLogLevel: (logLevel: LogLevel) => Logg
  /**
   * Dynamically set the log level. A copied clone of the logger is returned.
   *
   * @param logLevelString - The log level to set.
   * @returns
   */
  withLogLevelString: (logLevelString: LogLevelString) => Logg
  /**
   * Dynamically set the format. A copied clone of the logger is returned.
   *
   * @param format - The format to set.
   * @returns
   */
  withFormat: (format: Format) => Logg
  /**
   * Alias for `child()`
   *
   * @param fields - The fields to add to the logger.
   * @returns
   */
  withFields: (fields: Record<string, any>) => Logg
  /**
   * Works like `child()` and `withFields()`, but only adds a single field.
   *
   * @param key - The key of the field to add.
   * @param value - The value of the field to add.
   * @returns
   */
  withField: (key: string, value: any) => Logg
  /**
   * Works like `child()` and `withField('error', err instanceof Error ? err : String(err))`,
   * but will try to match up the type to determine whether the passed by value is an error
   * or not, then treat it as string when it fails to determine.
   *
   * @param err
   * @returns
   */
  withError: (err: Error | unknown) => Logg
  /**
   * Works like `child()`, but will try to get the call stack and add it to the logger.
   * This is useful for debugging purposes.
   */
  withCallStack: (errorLike: { message: string, stack?: string }) => Logg
  /**
   * Write a 'debug' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   * @returns
   */
  debug: (message: any, ...optionalParams: [...any, string?]) => void
  /**
   * Write a 'verbose' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   * @returns
   */
  verbose: (message: any, ...optionalParams: [...any, string?]) => void
  /**
   * Write a 'log' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   * @returns
   */
  log: (message: any, ...optionalParams: any[]) => void
  /**
   * Write an 'error' level log, if the configured level allows for it.
   * Prints to `stderr` with newline.
   *
   * @param message - The message to log.
   * @param stack - The stack trace to log.
   * @param optionalParams - Additional parameters to log.
   * @returns
   */
  error: (message: any, stack?: string, ...optionalParams: any[]) => void
  /**
   * Write an 'error' level log, if the configured level allows for it.
   * Prints to `stderr` with newline.
   *
   * @param message - The message to log
   * @param err - The related error
   * @param optionalParams - Additional parameters to log
   * @returns
   */
  errorWithError: (message: any, err: Error | unknown, ...optionalParams: any[]) => void
  /**
   * Write a 'warn' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   * @returns
   */
  warn: (message: any, ...optionalParams: [...any, string?]) => void
  /**
   * Sets the time format for log timestamps
   * @param format - date-fns compatible format string
   * @deprecated use {@link withTimeFormatter} instead
   */
  withTimeFormat: (format: string) => Logg
  /**
   * Set the time formatter for log timestamps to a custom function
   * @param fn - callback function that takes a Date object and returns a string
   */
  withTimeFormatter: (fn: (inputDate: Date) => string) => Logg
  /**
   * Set the error processor for log errors to a custom function
   * @param fn - callback function that takes an Error or unknown and returns an Error or unknown
   */
  withErrorProcessor: (fn: (err: Error | unknown) => Error | unknown) => Logg
}

interface InternalLogger extends Logg {
  fields: Record<string, any>
  context: string
  logLevel: LogLevel
  format: Format
  shouldUseGlobalConfig: boolean
  timeFormatter?: (inputDate: Date) => string
  errorProcessor: (err: Error | unknown) => Error | unknown
}

export function createLogg(context: string): Logg {
  const logObj: InternalLogger = {
    fields: {},
    context,
    logLevel: LogLevel.Debug,
    format: Format.JSON,
    shouldUseGlobalConfig: false,
    errorProcessor: (err: Error | unknown) => err,

    timeFormatter: (inputDate: Date) => inputDate.toISOString(),
    useGlobalConfig: (): Logg => {
      logObj.shouldUseGlobalConfig = true
      logObj.format = getGlobalFormat()
      logObj.logLevel = getGlobalLogLevel()

      return logObj.child()
    },
    child: (fields?: Record<string, any>): Logg => {
      const logger = createLogg(logObj.context) as InternalLogger

      if (typeof fields !== 'undefined' || fields !== null) {
        logger.fields = { ...logObj.fields, ...fields }
      }
      else {
        logger.fields = logObj.fields
      }
      if (logger.fields != null && 'context' in logger.fields) {
        logger.context = logger.fields.context as string
      }
      else {
        logger.context = logObj.context
      }

      logger.logLevel = logObj.logLevel
      logger.format = logObj.format
      logger.shouldUseGlobalConfig = logObj.shouldUseGlobalConfig

      return logger
    },

    withContext: (context: string): Logg => {
      const logger = logObj.child() as InternalLogger
      logger.context = context
      return logger
    },

    withLogLevel: (logLevel: LogLevel): Logg => {
      const logger = logObj.child() as InternalLogger

      if (availableLogLevels.includes(logLevel)) {
        logger.logLevel = logLevel
        logger.debug(
          `setting log level to ${logLevelToLogLevelStringMap[logLevel]} (${logLevel})`,
        )
      }
      else {
        throw new Error(
          `log level ${logLevel} is not available. available log levels are: ${availableLogLevels.join(
            ', ',
          )}`,
        )
      }

      return logger
    },

    withLogLevelString: (logLevelString: LogLevelString): Logg => {
      const logger = logObj.child() as InternalLogger

      if (availableLogLevelStrings.includes(logLevelString)) {
        logger.logLevel = logLevelStringToLogLevelMap[logLevelString]
        logger.debug(
          `setting log level to ${logLevelString} (${logLevelStringToLogLevelMap[logLevelString]})`,
        )
      }
      else {
        throw new Error(
          `log level ${logLevelString} is not available. available log levels are: ${availableLogLevelStrings.join(
            ', ',
          )}`,
        )
      }

      return logger
    },

    withFormat: (format: Format): Logg => {
      const logger = logObj.child() as InternalLogger

      if (availableFormats.includes(format)) {
        logger.format = format
        logger.debug(`setting format to ${format}`)
      }
      else {
        throw new Error(
          `format ${format} is not available. available formats are: ${availableFormats.join(
            ', ',
          )}`,
        )
      }

      return logger
    },

    withFields: (fields: Record<string, any>): Logg => {
      if (typeof fields === 'undefined' || fields === null) {
        return logObj.child({})
      }

      return logObj.child(fields)
    },

    withField(key: string, value: any): Logg {
      if (typeof key === 'undefined' || key === null) {
        throw new Error('key is required')
      }

      return logObj.child({ [key]: value })
    },

    withError: (err: Error | unknown): Logg => {
      err = logObj.errorProcessor(err)

      if (!isErrorLike(err)) {
        return logObj.withField('error', String(err))
      }

      let logger = logObj as Logg

      logger = logger.withField('error', err.message)
      if (err.stack != null) {
        logger = logger.withField('stack', err.stack)
      }
      if (err.cause != null) {
        try {
          logger = logger.withField('cause', JSON.stringify(err.cause))
        }
        catch {
          logger = logger.withField('cause', String(err.cause))
        }
      }

      return logger
    },

    withCallStack(errorLike: { message: string, stack?: string }): Logg {
      const stacks = parseErrorStacks(errorLike).slice(2).filter(item => !item.invalid)
      if (stacks.length === 0) {
        return logObj
      }

      return logObj.child({
        function: stacks[0].function,
        file: `${stacks[0].file}:${stacks[0].line}:${stacks[0].column}`,
        line: stacks[0].line,
        column: stacks[0].column,
      })
    },

    debug(message: any, ...optionalParams: [...any, string?]): void {
      let logLevel = logObj.logLevel
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel()
      }
      if (!shouldOutputDebugLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return
      }

      let format = logObj.format
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat()
      }

      if (optionalParams != null && optionalParams.length > 0) {
        logObj.fields = { ...logObj.fields, ...Object.fromEntries(optionalParams) }
      }

      const raw = newLog(
        LogLevelString.Debug,
        logObj.context,
        logObj.fields,
        message,
        logObj.shouldUseGlobalConfig ? getGlobalTimeFormatter() : logObj.timeFormatter,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.debug(JSON.stringify(raw))
          break
        case Format.Pretty:
          if (isBrowser()) {
            raw.fields = {}
            // eslint-disable-next-line no-console
            console.debug(toPrettyString(raw), logObj.fields)
            break
          }
          // eslint-disable-next-line no-console
          console.debug(toPrettyString(raw))
          break
        default:
          // eslint-disable-next-line no-console
          console.debug(JSON.stringify(raw))
          break
      }
    },

    verbose(message: any, ...optionalParams: [...any, string?]): void {
      let logLevel = logObj.logLevel
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel()
      }
      if (!shouldOutputVerboseLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return
      }

      let format = logObj.format
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat()
      }

      if (optionalParams != null && optionalParams.length > 0) {
        logObj.fields = merge(logObj.fields, ...optionalParams)
      }

      const raw = newLog(
        LogLevelString.Verbose,
        logObj.context,
        logObj.fields,
        message,
        logObj.shouldUseGlobalConfig ? getGlobalTimeFormatter() : logObj.timeFormatter,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
        case Format.Pretty:
          if (isBrowser()) {
            raw.fields = {}
            // eslint-disable-next-line no-console
            console.log(toPrettyString(raw), logObj.fields)
            break
          }
          // eslint-disable-next-line no-console
          console.log(toPrettyString(raw))
          break
        default:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
      }
    },

    log(message: any, ...optionalParams: any[]): void {
      let logLevel = logObj.logLevel
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel()
      }
      if (!shouldOutputLogLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return
      }

      let format = logObj.format
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat()
      }

      if (optionalParams != null && optionalParams.length > 0) {
        logObj.fields = merge(logObj.fields, ...optionalParams)
      }

      const raw = newLog(
        LogLevelString.Log,
        logObj.context,
        logObj.fields,
        message,
        logObj.shouldUseGlobalConfig ? getGlobalTimeFormatter() : logObj.timeFormatter,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
        case Format.Pretty:
          if (isBrowser()) {
            raw.fields = {}
            // eslint-disable-next-line no-console
            console.log(toPrettyString(raw), logObj.fields)
            break
          }
          // eslint-disable-next-line no-console
          console.log(toPrettyString(raw))
          break
        default:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
      }
    },

    error(message: any, stack?: string, ...optionalParams: any[]): void {
      let logLevel = logObj.logLevel
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel()
      }
      if (!shouldOutputErrorLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return
      }

      let format = logObj.format
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat()
      }

      if (optionalParams != null && optionalParams.length > 0) {
        logObj.fields = merge(logObj.fields, ...optionalParams)
      }

      const raw = newErrorLog(
        LogLevelString.Error,
        logObj.context,
        logObj.fields,
        message,
        stack,
        logObj.shouldUseGlobalConfig ? getGlobalTimeFormatter() : logObj.timeFormatter,
      )

      switch (format) {
        case Format.JSON:

          console.error(JSON.stringify(raw))
          break
        case Format.Pretty:
          if (isBrowser()) {
            raw.fields = {}

            console.error(toPrettyString(raw), logObj.fields)
            break
          }
          console.error(toPrettyString(raw))
          break
        default:

          console.error(JSON.stringify(raw))
          break
      }
    },

    errorWithError(message: string, err: Error | unknown, ...optionalParams: any[]) {
      return logObj.withError(err).error(message, undefined, ...optionalParams)
    },

    warn(message: any, ...optionalParams: [...any, string?]): void {
      let logLevel = logObj.logLevel
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel()
      }
      if (!shouldOutputWarningLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return
      }

      let format = logObj.format
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat()
      }

      if (optionalParams != null && optionalParams.length > 0) {
        logObj.fields = merge(logObj.fields, ...optionalParams)
      }

      const raw = newLog(
        LogLevelString.Warning,
        logObj.context,
        logObj.fields,
        message,
        logObj.shouldUseGlobalConfig ? getGlobalTimeFormatter() : logObj.timeFormatter,
      )

      switch (format) {
        case Format.JSON:

          console.warn(JSON.stringify(raw))
          break
        case Format.Pretty:
          if (isBrowser()) {
            raw.fields = {}

            console.warn(toPrettyString(raw), logObj.fields)
            break
          }
          console.warn(toPrettyString(raw))
          break
        default:

          console.warn(JSON.stringify(raw))
          break
      }
    },

    // TODO: remove in next major release
    withTimeFormat: (_: string): Logg => {
      const logger = logObj.child() as InternalLogger
      return logger
    },

    withTimeFormatter: (fn: (inputDate: Date) => string): Logg => {
      const logger = logObj.child() as InternalLogger
      logger.timeFormatter = fn
      return logger
    },

    withErrorProcessor: (fn: (err: Error | unknown) => Error | unknown): Logg => {
      const logger = logObj.child() as InternalLogger
      logger.errorProcessor = fn
      return logger
    },
  }

  return logObj
}

export const useLogg = createLogg

export function createLogger(context?: string): Logg {
  // eslint-disable-next-line unicorn/error-message
  const stack = ErrorStackParser.parse(new Error())
  const currentStack = stack[1]
  const basePath = currentStack.fileName?.replace('async', '').trim() ?? ''
  const fileName = path.join(...basePath.split(path.sep).slice(-2))

  context = context ?? `${fileName}:${currentStack.lineNumber}`

  return createLogg(withHyperlink(basePath, context))
}

export const useLogger = createLogger

export function createGlobalLogger(context?: string): Logg {
  return createLogger(context).useGlobalConfig()
}

export const useGlobalLogger = createGlobalLogger

export function initLogger(
  level = LogLevel.Verbose,
  format = Format.Pretty,
) {
  setGlobalLogLevel(level)
  setGlobalFormat(format)

  const logger = useLogg('logger').useGlobalConfig()
  logger.withFields({ level: LogLevel[level], format }).log('Logger initialized')
}
