import chalk, { type ChalkInstance } from 'chalk'

import { Format, LogLevel, LogLevelString } from './types'

export const logLevelStringToLogLevelMap: Record<LogLevelString, LogLevel> = {
  [LogLevelString.Error]: LogLevel.Error,
  [LogLevelString.Warning]: LogLevel.Warning,
  [LogLevelString.Log]: LogLevel.Log,
  [LogLevelString.Verbose]: LogLevel.Verbose,
  [LogLevelString.Debug]: LogLevel.Debug,
}

export const logLevelToLogLevelStringMap: Record<LogLevel, LogLevelString> = {
  [LogLevel.Error]: LogLevelString.Error,
  [LogLevel.Warning]: LogLevelString.Warning,
  [LogLevel.Log]: LogLevelString.Log,
  [LogLevel.Verbose]: LogLevelString.Verbose,
  [LogLevel.Debug]: LogLevelString.Debug,
}

export const availableLogLevelStrings: LogLevelString[] = [
  LogLevelString.Error,
  LogLevelString.Warning,
  LogLevelString.Log,
  LogLevelString.Verbose,
  LogLevelString.Debug,
]

export const logLevelToChalkColorMap: Record<LogLevel, ChalkInstance> = {
  [LogLevel.Error]: chalk.red,
  [LogLevel.Warning]: chalk.yellow,
  [LogLevel.Log]: chalk.blue,
  [LogLevel.Verbose]: chalk.cyan,
  [LogLevel.Debug]: chalk.green,
}

export const availableLogLevels: LogLevel[] = [
  LogLevel.Error,
  LogLevel.Warning,
  LogLevel.Log,
  LogLevel.Verbose,
  LogLevel.Debug,
]

export const availableFormats: Format[] = [Format.JSON, Format.Pretty]
