import type {
  Color,
} from 'colorette'
import {
  blue,
  cyan,
  green,
  red,
  yellow,
} from 'colorette'

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

export const logLevelToChalkColorMap: Record<LogLevel, Color> = {
  [LogLevel.Error]: red,
  [LogLevel.Warning]: yellow,
  [LogLevel.Log]: blue,
  [LogLevel.Verbose]: cyan,
  [LogLevel.Debug]: green,
}

export const availableLogLevels: LogLevel[] = [
  LogLevel.Error,
  LogLevel.Warning,
  LogLevel.Log,
  LogLevel.Verbose,
  LogLevel.Debug,
]

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

export const availableFormats: Format[] = [Format.JSON, Format.Pretty]
