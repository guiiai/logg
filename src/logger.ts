import { Format, LogLevel, LogLevelString } from './types'
import {
  availableFormats,
  availableLogLevelStrings,
  availableLogLevels,
  logLevelStringToLogLevelMap,
  logLevelToLogLevelStringMap,
} from './constants'
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
import { parseErrorStacks } from './stack'

const GLOBAL_CONFIG = {
  configured: false,
  logLevel: LogLevel.Debug,
  format: Format.JSON,
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

interface Logger {
  /**
   *
   * @returns Set the logger to use the global configuration.
   */
  useGlobalConfig: () => Logger
  /**
   * Create a child logger with additional fields.
   */
  child: (fields?: Record<string, any>) => Logger
  /**
   * Dynamically set the context. A copied clone of the logger is returned.
   *
   * @param context - The context to set, usually the name of the function or module.
   * @returns
   */
  withContext: (context: string) => Logger
  /**
   * Dynamically set the log level. A copied clone of the logger is returned.
   *
   * @param logLevel - The log level to set.
   * @returns
   */
  withLogLevel: (logLevel: LogLevel) => Logger
  /**
   * Dynamically set the log level. A copied clone of the logger is returned.
   *
   * @param logLevelString - The log level to set.
   * @returns
   */
  withLogLevelString: (logLevelString: LogLevelString) => Logger
  /**
   * Dynamically set the format. A copied clone of the logger is returned.
   *
   * @param format - The format to set.
   * @returns
   */
  withFormat: (format: Format) => Logger
  /**
   * Alias for `child()`
   *
   * @param fields - The fields to add to the logger.
   * @returns
   */
  withFields: (fields: Record<string, any>) => Logger
  /**
   * Works like `child()` and `withFields()`, but only adds a single field.
   *
   * @param key - The key of the field to add.
   * @param value - The value of the field to add.
   * @returns
   */
  withField: (key: string, value: any) => Logger
  /**
   * Works like `child()` and `withField('error', err instanceof Error ? err : String(err))`,
   * but will try to match up the type to determine whether the passed by value is an error
   * or not, then treat it as string when it fails to determine.
   *
   * @param err
   * @returns
   */
  withError: (err: Error | unknown) => Logger
  /**
   * Works like `child()`, but will try to get the call stack and add it to the logger.
   * This is useful for debugging purposes.
   */
  withCallStack: (errorLike: { message: string, stack?: string }) => Logger
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
}

interface InternalLogger extends Logger {
  fields: Record<string, any>
  context: string
  logLevel: LogLevel
  format: Format
  shouldUseGlobalConfig: boolean
}

export function createLogg(context: string): Logger {
  const logObj: InternalLogger = {
    fields: {},
    context,
    logLevel: LogLevel.Debug,
    format: Format.JSON,
    shouldUseGlobalConfig: false,
    useGlobalConfig: (): Logger => {
      logObj.shouldUseGlobalConfig = true
      logObj.format = getGlobalFormat()
      logObj.logLevel = getGlobalLogLevel()

      return logObj.child()
    },
    child: (fields?: Record<string, any>): Logger => {
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

    withContext: (context: string): Logger => {
      const logger = logObj.child() as InternalLogger
      logger.context = context
      return logger
    },

    withLogLevel: (logLevel: LogLevel): Logger => {
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

    withLogLevelString: (logLevelString: LogLevelString): Logger => {
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

    withFormat: (format: Format): Logger => {
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

    withFields: (fields: Record<string, any>): Logger => {
      if (typeof fields === 'undefined' || fields === null) {
        return logObj.child({})
      }

      return logObj.child(fields)
    },

    withField(key: string, value: any): Logger {
      if (typeof key === 'undefined' || key === null) {
        throw new Error('key is required')
      }

      // eslint-disable-next-line ts/no-unsafe-assignment
      return logObj.child({ [key]: value })
    },

    withError: (err: Error | unknown): Logger => {
      if (!isErrorLike(err)) {
        return logObj.withField('error', String(err))
      }

      let logger = logObj as Logger

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

    withCallStack(errorLike: { message: string, stack?: string }): Logger {
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

      const raw = newLog(
        LogLevelString.Debug,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        // eslint-disable-next-line ts/no-unsafe-argument
        ...optionalParams,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.debug(JSON.stringify(raw))
          break
        case Format.Pretty:
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

      const raw = newLog(
        LogLevelString.Verbose,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        // eslint-disable-next-line ts/no-unsafe-argument
        ...optionalParams,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
        case Format.Pretty:
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

      const raw = newLog(
        LogLevelString.Log,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        // eslint-disable-next-line ts/no-unsafe-argument
        ...optionalParams,
      )

      switch (format) {
        case Format.JSON:
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(raw))
          break
        case Format.Pretty:
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

      const raw = newErrorLog(
        LogLevelString.Error,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        stack,
        // eslint-disable-next-line ts/no-unsafe-argument
        ...optionalParams,
      )

      switch (format) {
        case Format.JSON:
          console.error(JSON.stringify(raw))
          break
        case Format.Pretty:
          console.error(toPrettyString(raw))
          break
        default:
          console.error(JSON.stringify(raw))
          break
      }
    },

    errorWithError(message: string, err: Error | unknown, ...optionalParams: any[]) {
      // eslint-disable-next-line ts/no-unsafe-argument
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

      const raw = newLog(
        LogLevelString.Warning,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        // eslint-disable-next-line ts/no-unsafe-argument
        ...optionalParams,
      )

      switch (format) {
        case Format.JSON:
          console.warn(JSON.stringify(raw))
          break
        case Format.Pretty:
          console.warn(toPrettyString(raw))
          break
        default:
          console.warn(JSON.stringify(raw))
          break
      }
    },
  }

  return logObj
}

export const useLogg = createLogg
