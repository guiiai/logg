import { Color } from 'colorette';

declare enum LogLevel {
    Error = 0,
    Warning = 1,
    Log = 2,
    Verbose = 3,
    Debug = 4
}
declare enum LogLevelString {
    Error = "error",
    Warning = "warn",
    Log = "log",
    Verbose = "verbose",
    Debug = "debug"
}
declare enum Format {
    JSON = "json",
    Pretty = "pretty"
}
interface Log {
    '@timestamp': string;
    'level': LogLevelString;
    'fields': {
        context?: string;
        isNestSystemModule?: boolean;
        nestSystemModule?: string;
        [key: string]: any;
    };
    'message': string;
    'errored'?: boolean;
    'error'?: {
        stack?: string;
    };
}

declare function getGlobalLogLevel(): LogLevel;
declare function setGlobalLogLevel(logLevel: LogLevel): void;
declare function getGlobalLogLevelString(): LogLevelString;
declare function setGlobalLogLevelString(logLevelString: LogLevelString): void;
declare function getGlobalFormat(): Format;
declare function setGlobalFormat(format: Format): void;
interface Logger {
    /**
     *
     * @returns Set the logger to use the global configuration.
     */
    useGlobalConfig: () => Logger;
    /**
     * Create a child logger with additional fields.
     */
    child: (fields?: Record<string, any>) => Logger;
    /**
     * Dynamically set the context. A copied clone of the logger is returned.
     *
     * @param context - The context to set, usually the name of the function or module.
     * @returns
     */
    withContext: (context: string) => Logger;
    /**
     * Dynamically set the log level. A copied clone of the logger is returned.
     *
     * @param logLevel - The log level to set.
     * @returns
     */
    withLogLevel: (logLevel: LogLevel) => Logger;
    /**
     * Dynamically set the log level. A copied clone of the logger is returned.
     *
     * @param logLevelString - The log level to set.
     * @returns
     */
    withLogLevelString: (logLevelString: LogLevelString) => Logger;
    /**
     * Dynamically set the format. A copied clone of the logger is returned.
     *
     * @param format - The format to set.
     * @returns
     */
    withFormat: (format: Format) => Logger;
    /**
     * Alias for `child()`
     *
     * @param fields - The fields to add to the logger.
     * @returns
     */
    withFields: (fields: Record<string, any>) => Logger;
    /**
     * Works like `child()` and `withFields()`, but only adds a single field.
     *
     * @param key - The key of the field to add.
     * @param value - The value of the field to add.
     * @returns
     */
    withField: (key: string, value: any) => Logger;
    /**
     * Works like `child()` and `withField('error', err instanceof Error ? err : String(err))`,
     * but will try to match up the type to determine whether the passed by value is an error
     * or not, then treat it as string when it fails to determine.
     *
     * @param err
     * @returns
     */
    withError: (err: Error | unknown) => Logger;
    /**
     * Write a 'debug' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     *
     * @param message - The message to log.
     * @param optionalParams - Additional parameters to log.
     * @returns
     */
    debug: (message: any, ...optionalParams: [...any, string?]) => void;
    /**
     * Write a 'verbose' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     *
     * @param message - The message to log.
     * @param optionalParams - Additional parameters to log.
     * @returns
     */
    verbose: (message: any, ...optionalParams: [...any, string?]) => void;
    /**
     * Write a 'log' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     *
     * @param message - The message to log.
     * @param optionalParams - Additional parameters to log.
     * @returns
     */
    log: (message: any, ...optionalParams: any[]) => void;
    /**
     * Write an 'error' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     *
     * @param message - The message to log.
     * @param stack - The stack trace to log.
     * @param optionalParams - Additional parameters to log.
     * @returns
     */
    error: (message: any, stack?: string, ...optionalParams: any[]) => void;
    /**
     * Write an 'error' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     *
     * @param message - The message to log
     * @param err - The related error
     * @param optionalParams - Additional parameters to log
     * @returns
     */
    errorWithError: (message: any, err: Error | unknown, ...optionalParams: any[]) => void;
    /**
     * Write a 'warn' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     *
     * @param message - The message to log.
     * @param optionalParams - Additional parameters to log.
     * @returns
     */
    warn: (message: any, ...optionalParams: [...any, string?]) => void;
}
declare function createLogg(context: string): Logger;
declare const useLogg: typeof createLogg;

declare const logLevelStringToLogLevelMap: Record<LogLevelString, LogLevel>;
declare const logLevelToLogLevelStringMap: Record<LogLevel, LogLevelString>;
declare const availableLogLevelStrings: LogLevelString[];
declare const logLevelToChalkColorMap: Record<LogLevel, Color>;
declare const availableLogLevels: LogLevel[];
declare function shouldOutputDebugLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean;
declare function shouldOutputVerboseLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean;
declare function shouldOutputLogLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean;
declare function shouldOutputWarningLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean;
declare function shouldOutputErrorLevelLogWhenLogLevelIsOneOf(logLevel: LogLevel): boolean;
declare const availableFormats: Format[];

export { Format, type Log, LogLevel, LogLevelString, availableFormats, availableLogLevelStrings, availableLogLevels, createLogg, getGlobalFormat, getGlobalLogLevel, getGlobalLogLevelString, logLevelStringToLogLevelMap, logLevelToChalkColorMap, logLevelToLogLevelStringMap, setGlobalFormat, setGlobalLogLevel, setGlobalLogLevelString, shouldOutputDebugLevelLogWhenLogLevelIsOneOf, shouldOutputErrorLevelLogWhenLogLevelIsOneOf, shouldOutputLogLevelLogWhenLogLevelIsOneOf, shouldOutputVerboseLevelLogWhenLogLevelIsOneOf, shouldOutputWarningLevelLogWhenLogLevelIsOneOf, useLogg };
