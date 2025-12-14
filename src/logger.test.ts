import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getGlobalFormat, getGlobalLogLevel, setGlobalFormat, setGlobalLogLevel, useLogg, useLogger } from './logger'
import { Format, LogLevel } from './types'

// Test data
const data = {
  database: {
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: '123456',
    database: 'postgres',
    url: 'postgres://postgres:123456@localhost:5433/postgres',
  },
}

describe('logg', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleDebugSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should log with pretty format and debug level', () => {
    const log = useLogg('test').withFormat(Format.Pretty).withLogLevel(LogLevel.Debug)

    log.debug('debug message')
    log.log('log message')
    log.warn('warn message')
    log.error('error message')

    // withFormat and withLogLevel each call debug once, plus actual debug call = 3
    expect(consoleDebugSpy).toHaveBeenCalledTimes(3)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

    const debugCall = consoleDebugSpy.mock.calls[2][0]
    expect(debugCall).toContain('debug message')
    expect(debugCall).toContain('test')
  })

  it('should log with json format and debug level', () => {
    const log = useLogg('test').withFormat(Format.JSON).withLogLevel(LogLevel.Debug)

    log.debug('debug')
    log.log('log')
    log.warn('warn')
    log.error('error')

    expect(consoleDebugSpy).toHaveBeenCalledTimes(3) // withFormat + withLogLevel + actual debug
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

    // Verify JSON format
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.message).toBe('log')
    expect(parsed.context).toBe('test') // context is in fields
    expect(parsed.level).toBe('log')
  })

  it('should respect log level filtering', () => {
    const log = useLogg('test').withLogLevel(LogLevel.Warning)

    log.debug('should not appear')
    log.log('should not appear')
    log.warn('should appear')
    log.error('should appear')

    // withLogLevel is Warning, so debug call from withLogLevel itself won't appear
    expect(consoleDebugSpy).toHaveBeenCalledTimes(0)
    expect(consoleLogSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
  })

  it('should be able to set and get global log level', () => {
    setGlobalLogLevel(LogLevel.Debug)
    const level = getGlobalLogLevel()
    expect(level).toBe(LogLevel.Debug)

    setGlobalLogLevel(LogLevel.Warning)
    expect(getGlobalLogLevel()).toBe(LogLevel.Warning)
  })

  it('should be able to set and get global log format', () => {
    setGlobalFormat(Format.JSON)
    const format = getGlobalFormat()
    expect(format).toBe(Format.JSON)

    setGlobalFormat(Format.Pretty)
    expect(getGlobalFormat()).toBe(Format.Pretty)
  })

  it('should throw error for invalid log level', () => {
    expect(() => setGlobalLogLevel(999 as LogLevel)).toThrow('log level 999 is not available')
  })

  it('should throw error for invalid format', () => {
    expect(() => setGlobalFormat('invalid' as Format)).toThrow('format invalid is not available')
  })

  it('should use global config when useGlobalConfig is called', () => {
    setGlobalLogLevel(LogLevel.Warning)
    setGlobalFormat(Format.JSON)

    const logger = useLogg('test').useGlobalConfig()

    logger.debug('should not appear')
    logger.warn('should appear')

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)

    const warnCall = consoleWarnSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(warnCall)
    expect(parsed.level).toBe('warn')
  })

  it('should log error with stack trace', () => {
    setGlobalLogLevel(LogLevel.Verbose)
    setGlobalFormat(Format.JSON)
    const logger = useLogg('main').useGlobalConfig()

    const error = new Error('This is an error')
    logger.errorWithError('test error', error)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const errorCall = consoleErrorSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(errorCall)
    expect(parsed.message).toBe('test error')
    expect(parsed.fields.error).toBe('This is an error')
    expect(parsed.fields.stack).toBeDefined()
  })

  it('should log with additional fields', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug)

    logger.withFields({ userId: 123, action: 'login' }).log('user action')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.userId).toBe(123)
    expect(parsed.fields.action).toBe('login')
  })

  it('should log with optional params as fields', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug)

    logger.log('log with data', data)

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    // Fields are stored as an array-like object
    expect(parsed.fields[0]).toEqual(data)
  })

  it('should support child logger with inherited fields', () => {
    setGlobalFormat(Format.JSON)
    const parentLogger = useLogg('parent').withLogLevel(LogLevel.Debug).withFields({ parentField: 'value' })
    const childLogger = parentLogger.child({ childField: 'childValue' })

    childLogger.log('child log')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.parentField).toBe('value')
    expect(parsed.fields.childField).toBe('childValue')
  })

  it('should support withContext to change context name', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug).withContext('new-context')

    logger.log('test message')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.context).toBe('new-context')
  })

  it('should support withField to add single field', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug).withField('key', 'value')

    logger.log('test message')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.key).toBe('value')
  })

  it('should support withError to log error as field', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug)
    const error = new Error('Test error')

    logger.withError(error).log('error occurred')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.error).toBe('Test error')
    expect(parsed.fields.stack).toBeDefined()
  })

  it('should handle non-Error objects in withError', () => {
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').withLogLevel(LogLevel.Debug)

    logger.withError('string error').log('error occurred')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.error).toBe('string error')
  })

  it('should support verbose log level', () => {
    const logger = useLogg('test').withLogLevel(LogLevel.Verbose)

    logger.debug('should not appear')
    logger.verbose('should appear')
    logger.log('should appear')

    // Verbose level filters out debug, withLogLevel won't output debug either
    expect(consoleDebugSpy).toHaveBeenCalledTimes(0)
    expect(consoleLogSpy).toHaveBeenCalledTimes(2) // verbose + log
  })
})

describe('logger (useLogger)', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleDebugSpy.mockRestore()
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should automatically use global config', () => {
    setGlobalLogLevel(LogLevel.Warning)
    setGlobalFormat(Format.JSON)

    const log = useLogger('test')

    log.debug('should not appear')
    log.warn('should appear')

    expect(consoleDebugSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
  })

  it('should support format override', () => {
    setGlobalFormat(Format.JSON)
    setGlobalLogLevel(LogLevel.Debug)
    const log = useLogger('test').withFormat(Format.Pretty).withLogLevel(LogLevel.Debug)

    log.log('test message')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    // Pretty format should not be JSON
    expect(() => JSON.parse(logCall)).toThrow()
  })

  it('should support log level override', () => {
    setGlobalLogLevel(LogLevel.Warning)
    const log = useLogger('test').withLogLevel(LogLevel.Debug)

    log.debug('should appear after override')

    // withLogLevel disables global config and sets level to Debug
    // So it outputs debug: one from withLogLevel itself, one from actual debug call
    expect(consoleDebugSpy).toHaveBeenCalledTimes(2)
  })

  it('should include file location in context', () => {
    setGlobalFormat(Format.JSON)
    setGlobalLogLevel(LogLevel.Debug)
    const logger = useLogger()

    logger.log('test message')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0]
    // Verify it's a string before parsing
    expect(typeof logCall).toBe('string')
    if (typeof logCall === 'string') {
      const parsed = JSON.parse(logCall)
      expect(parsed.context).toContain('.ts')
    }
  })

  it('should log error with stack using errorWithError', () => {
    setGlobalLogLevel(LogLevel.Verbose)
    setGlobalFormat(Format.JSON)
    const logger = useLogger('main')

    const error = new Error('This is an error')
    logger.errorWithError('test', error)

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    const errorCall = consoleErrorSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(errorCall)
    expect(parsed.message).toBe('test')
    expect(parsed.fields.error).toBe('This is an error')
  })

  it('should log with fields without showing [Object object]', () => {
    setGlobalFormat(Format.JSON)
    setGlobalLogLevel(LogLevel.Debug)
    const logger = useLogger('test')

    logger.withFields(data).log('log with fields')

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const logCall = consoleLogSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(logCall)
    expect(parsed.fields.database).toEqual(data.database)
    expect(logCall).not.toContain('[Object object]')
  })

  it('should not accumulate optionalParams across multiple log calls', () => {
    setGlobalFormat(Format.JSON)
    setGlobalLogLevel(LogLevel.Debug)
    const logger = useLogger('test')

    // First log with optional params
    logger.log('first log', { key1: 'value1' })
    const firstLogCall = consoleLogSpy.mock.calls[0][0] as string
    const firstParsed = JSON.parse(firstLogCall)
    // Optional params are spread into fields object with numeric keys
    expect(firstParsed.fields[0]).toEqual({ key1: 'value1' })
    expect(firstParsed.context).toBe('test')

    // Second log with different optional params
    logger.log('second log', { key2: 'value2' })
    const secondLogCall = consoleLogSpy.mock.calls[1][0] as string
    const secondParsed = JSON.parse(secondLogCall)

    // Should only contain key2, not accumulated key1
    expect(secondParsed.fields[0]).toEqual({ key2: 'value2' })
    expect(secondParsed.fields[1]).toBeUndefined() // No accumulated data
    expect(secondParsed.context).toBe('test')
  })

  it('should not accumulate fields in child logger across multiple log calls', () => {
    setGlobalFormat(Format.JSON)
    setGlobalLogLevel(LogLevel.Debug)
    const logger = useLogger('test').withFields({ persistent: 'field' })

    // First log with optional params
    logger.log('first log', { temp1: 'value1' })
    const firstLogCall = consoleLogSpy.mock.calls[0][0] as string
    const firstParsed = JSON.parse(firstLogCall)
    // When withFields is combined with optionalParams, array is spread into object with numeric keys
    expect(firstParsed.fields[0]).toEqual({ persistent: 'field' })
    expect(firstParsed.fields[1]).toEqual({ temp1: 'value1' })
    expect(firstParsed.context).toBe('test')

    // Second log with different optional params
    logger.log('second log', { temp2: 'value2' })
    const secondLogCall = consoleLogSpy.mock.calls[1][0] as string
    const secondParsed = JSON.parse(secondLogCall)

    // Should have persistent field but only temp2, not temp1
    expect(secondParsed.fields[0]).toEqual({ persistent: 'field' })
    expect(secondParsed.fields[1]).toEqual({ temp2: 'value2' })
    expect(secondParsed.fields[2]).toBeUndefined() // No accumulated data
    expect(secondParsed.context).toBe('test')
  })
})
