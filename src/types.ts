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
  'fields': {
    context?: string
    isNestSystemModule?: boolean
    nestSystemModule?: string
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
