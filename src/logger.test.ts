import { describe, expect, it } from 'vitest'

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
  it('should log with pretty and debug level', () => {
    const log = useLogg('test').withFormat(Format.Pretty).withLogLevel(LogLevel.Debug)
    log.debug('debug')
    log.log('log')
    log.warn('warn')
    log.error('error')
  })

  it('should log with json and debug level', () => {
    const log = useLogg('test').withFormat(Format.JSON).withLogLevel(LogLevel.Debug)
    log.debug('debug')
    log.log('log')
    log.warn('warn')
    log.error('error')
  })

  it('should be able to set global log level', () => {
    setGlobalLogLevel(LogLevel.Debug)
    const level = getGlobalLogLevel()
    expect(level).toBe(LogLevel.Debug)
  })

  it('should be able to set global log format', () => {
    setGlobalFormat(Format.JSON)
    const format = getGlobalFormat()
    expect(format).toBe(Format.JSON)
  })

  it('should be able to log error with stack', () => {
    setGlobalLogLevel(LogLevel.Verbose)
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('main').useGlobalConfig()

    const error = new Error('This is an error')
    logger.errorWithError('test', error)
  })

  it('should log with fields and not show [Object object]', () => {
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.withFields(data).log('log with array fields')
  })

  it('should log with fields and not show [Object object] when using optional params', () => {
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('log with array fields', data)
    logger.log('log with array fields', { data })
    logger.log('log with array fields', [data])
  })

  it('should log fields directly in browser', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('log with array fields', data)
  })

  it('should not log fields directly in browser when using json format', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('log with array fields', data)
  })

  it('should process fields in browser when using json format', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.JSON)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('log with array fields', data, 1, 'test')
    logger.log('log with array fields', [1, 2, 3])
  })

  it('should parse multiple arguments', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log(`Test message with multiple arguments`, 'ABC', data, `enabled: ${true}`)
  })

  it('should parse single argument as array', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('Test message with array argument', [1, 2, 3])
  })

  it('should parse single argument', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('Test message with single argument', 1)
  })

  it('should parse no argument', () => {
    (globalThis as any).window = {}
    setGlobalFormat(Format.Pretty)
    const logger = useLogg('test').useGlobalConfig()

    logger.log('Test message with no arguments')
  })
})

describe('logger', () => {
  it('should log with pretty and debug level', () => {
    const log = useLogger('test').withFormat(Format.Pretty).withLogLevel(LogLevel.Debug)
    log.debug('debug')
    log.log('log')
    log.warn('warn')
    log.error('error')
  })

  it('should log with json and debug level', () => {
    const log = useLogger('test').withFormat(Format.JSON).withLogLevel(LogLevel.Debug)
    log.debug('debug')
    log.log('log')
    log.warn('warn')
    log.error('error')
  })

  it('should be able to set global log level', () => {
    setGlobalLogLevel(LogLevel.Debug)
    const level = getGlobalLogLevel()
    expect(level).toBe(LogLevel.Debug)
  })

  it('should be able to set global log format', () => {
    setGlobalFormat(Format.JSON)
    const format = getGlobalFormat()
    expect(format).toBe(Format.JSON)
  })

  it('should be able to log error with stack', () => {
    setGlobalLogLevel(LogLevel.Verbose)
    setGlobalFormat(Format.Pretty)
    const logger = useLogger('main').useGlobalConfig()

    const error = new Error('This is an error')
    logger.errorWithError('test', error)
  })

  it('should log with fields and not show [Object object]', () => {
    setGlobalFormat(Format.Pretty)
    const logger = useLogger('test').useGlobalConfig()

    logger.withFields(data).log('log with array fields')
  })
})
