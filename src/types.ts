import type { Logg } from './logger'

export enum LogLevel {
  Error,
  Warning,
  Log,
  Verbose,
  Debug,
}

export enum LogLevelString {
  Error = 'error',
  Warning = 'warn',
  Log = 'log',
  Verbose = 'verbose',
  Debug = 'debug',
}

export enum Format {
  JSON = 'json',
  Pretty = 'pretty',
}

export interface Log {
  '@timestamp': number
  '@localetime': string
  'level': LogLevelString
  'context': string
  'fields': {
    [key: string]: any
  }
  'message': string
  'errored'?: boolean
  'error'?: {
    stack?: string
  }
}

export interface LoggerConfig {
  timeFormat?: string
}

export type Logger = Logg

export { Format as LoggerFormat, LogLevel as LoggerLevel }
