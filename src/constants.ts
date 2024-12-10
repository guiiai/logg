import pc from 'picocolors'

import { Format, LogLevel, LogLevelString } from './types'

type PicoColorsFormatter = (input: string | number | null | undefined) => string

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

export const logLevelToColorMap: Record<LogLevel, PicoColorsFormatter> = {
  [LogLevel.Error]: pc.red,
  [LogLevel.Warning]: pc.yellow,
  [LogLevel.Log]: pc.blue,
  [LogLevel.Verbose]: pc.cyan,
  [LogLevel.Debug]: pc.green,
}

export const availableLogLevels: LogLevel[] = [
  LogLevel.Error,
  LogLevel.Warning,
  LogLevel.Log,
  LogLevel.Verbose,
  LogLevel.Debug,
]

export const availableFormats: Format[] = [Format.JSON, Format.Pretty]
