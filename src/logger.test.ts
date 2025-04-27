import { describe, expect, it } from 'vitest'

import { getGlobalFormat, getGlobalLogLevel, setGlobalFormat, setGlobalLogLevel, useLogg } from './logger'
import { Format, LogLevel } from './types'

describe('logger', () => {
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
})
