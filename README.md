# @guiiai/logg

Yet another simple, nearly zero dependency, structural log compliance logger implementation.

## Features

- 🛠️ Stack Parse: Automatically captures and includes stack trace information for enhanced debugging.
- 📞 Caller Records: Provides detailed information about the calling function and file.
- 🗄️ JSON Format & stdout: Outputs logs in JSON format to stdout for easy parsing and integration with log management tools.
- 🔄 Drop-in Replacement for Winston: Can be used as a direct replacement for the popular Winston logger.
- 📏 Best Practices for Structural Logging: Implements industry best practices for structured logging.
- 🧩 Intuitive API: Simple and easy-to-use API for quick integration into your projects.

## Preview

<img width="817" alt="image" src="https://github.com/user-attachments/assets/1cd7efb2-2257-409b-8011-7de69320f2be">

## Installation

```bash
npm install @guiiai/logg
```

## Usage

```javascript
import { createLogg, Format, LogLevel, setGlobalFormat, setGlobalLogLevel } from '@guiiai/logg'

setGlobalLogLevel(LogLevel.Debug)
setGlobalFormat(Format.Pretty) // Otherwise it will output JSON

// Create a logger instance with a specific context
const log = createLogg('http/request').useGlobalConfig()

// Log a 404 error with additional fields
log
  .withField('requestId', req.id)
  .withField('url', req.url)
  .error('Resource not found (404)')
```

## API

### Creating a Logger

- `createLogg(context: string)`: Creates a new logger instance with the specified context.

### Logger Configuration

- `useGlobalConfig()`: Applies global configuration to the logger instance.
- `child(fields?: Record<string, any>)`: Creates a child logger with additional fields.
- `withContext(context: string)`: Sets the context dynamically. Returns a cloned logger instance.
- `withLogLevel(logLevel: LogLevel)`: Sets the log level dynamically. Returns a cloned logger instance.
- `withLogLevelString(logLevelString: LogLevelString)`: Sets the log level dynamically using string. Returns a cloned logger instance.
- `withFormat(format: Format)`: Sets the format dynamically. Returns a cloned logger instance.
- `withFields(fields: Record<string, any>)`: Alias for `child()`.
- `withField(key: string, value: any)`: Adds a single custom field to the log entry.
- `withError(err: Error | unknown)`: Attaches an error object to the log entry.

### Logging Methods

- `debug(message: any, ...optionalParams: [...any, string?])`: Logs a debug message.
- `verbose(message: any, ...optionalParams: [...any, string?])`: Logs a verbose message.
- `log(message: any, ...optionalParams: any[])`: Logs a general message.
- `error(message: any, stack?: string, ...optionalParams: any[])`: Logs an error message.
- `errorWithError(message: any, err: Error | unknown, ...optionalParams: any[])`: Logs an error message with an error object.
- `warn(message: any, ...optionalParams: [...any, string?])`: Logs a warning message.

### Global Configuration Functions

- `getGlobalLogLevel()`: Retrieves the global log level.
- `setGlobalLogLevel(logLevel: LogLevel)`: Sets the global log level.
- `getGlobalLogLevelString()`: Retrieves the global log level as a string.
- `setGlobalLogLevelString(logLevelString: LogLevelString)`: Sets the global log level using a string.
- `getGlobalFormat()`: Retrieves the global format.
- `setGlobalFormat(format: Format)`: Sets the global format.

### Enums

- `LogLevel`: Enum for log levels (`Error`, `Warning`, `Log`, `Verbose`, `Debug`).
- `LogLevelString`: Enum for log level strings (`error`, `warn`, `log`, `verbose`, `debug`).
- `Format`: Enum for log formats (`JSON`, `Pretty`).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=guiiai/logg&type=Date)](https://star-history.com/#guiiai/logg&Date)

## Contributors

[![contributors](https://contrib.rocks/image?repo=guiiai/logg)](https://github.com/guiiai/logg/graphs/contributors)

### Made with ❤
