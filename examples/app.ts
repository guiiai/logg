import { createLogg, Format, LogLevel, setGlobalFormat, setGlobalLogLevel } from '../src'

setGlobalLogLevel(LogLevel.Debug)
setGlobalFormat(Format.Pretty) // Otherwise it will output JSON

// Create a logger instance with a specific context
const log = createLogg('http/request').useGlobalConfig()

log
  .withField('url', 'https://github.com/guiiai/logg')
  .log('Welcome to our repository')
