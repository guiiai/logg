# @guiiai/logg

[![npm version](https://badge.fury.io/js/@guiiai%2Flogg.svg)](https://www.npmjs.com/package/@guiiai/logg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Yet another simple, nearly zero dependency, structural log compliance logger implementation.

## Features

- 🛠️ **Stack Parse**: Automatically captures and includes stack trace information for enhanced debugging
- 📞 **Caller Records**: Provides detailed information about the calling function and file with clickable hyperlinks
- 🗄️ **JSON Format & stdout**: Outputs logs in JSON format to stdout for easy parsing and integration with log management tools
- 🎨 **Pretty Format**: Beautiful colored output for development with browser console support
- 🔄 **Drop-in Replacement**: Can be used as a direct replacement for popular loggers like Winston
- 📏 **Best Practices**: Implements industry best practices for structured logging
- 🧩 **Intuitive API**: Simple and easy-to-use fluent API for quick integration
- 🌐 **Universal**: Works in both Node.js and browser environments
- ⚡ **Zero Config**: Works out of the box with sensible defaults

## Preview

<img width="817" alt="image" src="https://github.com/user-attachments/assets/1cd7efb2-2257-409b-8011-7de69320f2be">

## Installation

```bash
npm install @guiiai/logg
```

## Quick Start

```typescript
import { initLogger, useGlobalLogger } from '@guiiai/logg'

// Initialize with defaults (Verbose level, Pretty format)
initLogger()

// Create a logger and start logging
const log = useGlobalLogger('MyApp')
log.log('Hello world!')
```

## Usage Examples

### Basic Usage

```typescript
import { createLogg, Format, LogLevel, setGlobalFormat, setGlobalLogLevel } from '@guiiai/logg'

setGlobalLogLevel(LogLevel.Debug)
setGlobalFormat(Format.Pretty) // Otherwise it will output JSON

// Create a logger instance with a specific context
const log = createLogg('http/request').useGlobalConfig()

// Log messages with different levels
log.debug('Debugging info')
log.log('Regular log')
log.warn('Warning message')
log.error('Error occurred')
```

### Adding Custom Fields

```typescript
// Add single field
log
  .withField('requestId', req.id)
  .withField('url', req.url)
  .error('Resource not found (404)')

// Add multiple fields at once
log
  .withFields({
    userId: '12345',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0'
  })
  .log('User logged in')
```

### Error Handling

```typescript
try {
  // Some operation
} catch (err) {
  // Automatically extracts error message, stack trace, and cause
  log.withError(err).error('Operation failed')

  // Or use errorWithError for more control
  log.errorWithError('Failed to process request', err)
}
```

### Child Loggers

```typescript
const parentLog = createLogg('app').useGlobalConfig()

// Create child logger with persistent fields
const childLog = parentLog.child({
  module: 'database',
  version: '1.0.0'
})

// All logs from childLog will include the parent fields
childLog.log('Connected to database')
```

### Auto-Context Logger

```typescript
import { createLogger } from '@guiiai/logg'

// Automatically includes file path and line number with clickable hyperlinks
const log = createLogger().useGlobalConfig()
log.log('This log knows where it came from!')
```

### Custom Time Format

```typescript
const log = createLogg('app')
  .useGlobalConfig()
  .withTimeFormatter((date) => {
    return date.toLocaleString('en-US', {
      timeZone: 'America/New_York'
    })
  })

log.log('Log with custom timestamp')
```

### Error Processing

```typescript
// Transform errors before logging
const log = createLogg('app')
  .useGlobalConfig()
  .withErrorProcessor((err) => {
    if (err instanceof CustomError) {
      // Add custom properties or transform the error
      return { ...err, customField: 'value' }
    }
    return err
  })

log.withError(someError).error('Processed error')
```

## API Reference

### Logger Factory Functions

#### `createLogg(context: string): Logg`
Creates a new logger instance with the specified context.

```typescript
const log = createLogg('MyModule')
```

#### `createLogger(context?: string): Logg`
Creates a logger with automatic context from the call site (file path and line number). Includes clickable hyperlinks in supported terminals.

```typescript
const log = createLogger() // Context is auto-generated
const log2 = createLogger('CustomContext') // Override with custom context
```

#### `createGlobalLogger(context?: string): Logg`
Creates a logger with automatic context and applies global configuration.

```typescript
const log = createGlobalLogger()
```

#### `initLogger(level?: LogLevel, format?: Format): void`
Initializes global logger configuration with defaults.

```typescript
import { initLogger, LogLevel, Format } from '@guiiai/logg'

initLogger(LogLevel.Verbose, Format.Pretty)
```

**Aliases:**
- `useLogg` → `createLogg`
- `useLogger` → `createLogger`
- `useGlobalLogger` → `createGlobalLogger`

### Logger Instance Methods

#### Configuration Methods

- **`useGlobalConfig(): Logg`** - Applies global configuration to the logger instance
- **`child(fields?: Record<string, any>): Logg`** - Creates a child logger with additional persistent fields
- **`withContext(context: string): Logg`** - Sets context dynamically (returns cloned instance)
- **`withLogLevel(logLevel: LogLevel): Logg`** - Sets log level dynamically (returns cloned instance)
- **`withLogLevelString(logLevelString: LogLevelString): Logg`** - Sets log level using string (returns cloned instance)
- **`withFormat(format: Format): Logg`** - Sets output format dynamically (returns cloned instance)
- **`withFields(fields: Record<string, any>): Logg`** - Alias for `child()`
- **`withField(key: string, value: any): Logg`** - Adds a single custom field
- **`withError(err: Error | unknown): Logg`** - Attaches error object with automatic extraction of message, stack, and cause
- **`withCallStack(errorLike: { message: string, stack?: string }): Logg`** - Adds call stack information
- **`withTimeFormatter(fn: (date: Date) => string): Logg`** - Sets custom time formatter function
- **`withErrorProcessor(fn: (err: Error | unknown) => Error | unknown): Logg`** - Sets custom error processor function

#### Logging Methods

- **`debug(message: any, ...optionalParams: any[]): void`** - Logs debug-level message
- **`verbose(message: any, ...optionalParams: any[]): void`** - Logs verbose-level message
- **`log(message: any, ...optionalParams: any[]): void`** - Logs info-level message
- **`warn(message: any, ...optionalParams: any[]): void`** - Logs warning-level message
- **`error(message: any, stack?: string, ...optionalParams: any[]): void`** - Logs error-level message
- **`errorWithError(message: any, err: Error | unknown, ...optionalParams: any[]): void`** - Logs error with automatic error extraction

### Global Configuration

#### Log Level

```typescript
import { getGlobalLogLevel, setGlobalLogLevel, LogLevel } from '@guiiai/logg'

setGlobalLogLevel(LogLevel.Debug)
const level = getGlobalLogLevel()

// Or use string-based methods
import { setGlobalLogLevelString, getGlobalLogLevelString } from '@guiiai/logg'

setGlobalLogLevelString('debug')
const levelString = getGlobalLogLevelString()
```

#### Format

```typescript
import { getGlobalFormat, setGlobalFormat, Format } from '@guiiai/logg'

setGlobalFormat(Format.Pretty)
const format = getGlobalFormat()
```

#### Time Formatter

```typescript
import { setGlobalTimeFormatter, getGlobalTimeFormatter } from '@guiiai/logg'

setGlobalTimeFormatter((date) => date.toISOString())
const formatter = getGlobalTimeFormatter()
```

### Enums and Types

#### `LogLevel`
```typescript
enum LogLevel {
  Error = 0,
  Warning = 1,
  Log = 2,
  Verbose = 3,
  Debug = 4
}
```

#### `LogLevelString`
```typescript
type LogLevelString = 'error' | 'warn' | 'log' | 'verbose' | 'debug'
```

#### `Format`
```typescript
enum Format {
  JSON = 'json',
  Pretty = 'pretty'
}
```

## Configuration

### Log Levels

Log levels control which messages are output. Higher levels include all lower levels.

| Level | Value | Description |
|-------|-------|-------------|
| Error | 0 | Only error messages |
| Warning | 1 | Errors and warnings |
| Log | 2 | Errors, warnings, and general logs |
| Verbose | 3 | All above plus verbose information |
| Debug | 4 | All messages including debug info |

### Output Formats

#### JSON Format
Structured JSON output, ideal for production environments and log aggregation tools.

```json
{"level":"log","context":"app","timestamp":"2024-01-01T00:00:00.000Z","message":"User logged in","fields":{"userId":"123"}}
```

#### Pretty Format
Human-readable colored output for development. Automatically detects browser environments and adjusts output accordingly.

```
[2024-01-01 00:00:00] LOG app: User logged in { userId: '123' }
```

## Environment Support

### Node.js
Full support for all features including:
- Terminal hyperlinks (VS Code, iTerm2, etc.)
- Colored output
- Stack trace parsing

### Browser
Optimized browser support with:
- Console-friendly output
- Proper object expansion in browser devtools
- Automatic format detection

## Why @guiiai/logg?

- **Lightweight**: Minimal dependencies (only 3 runtime deps)
- **Type-safe**: Full TypeScript support with complete type definitions
- **Flexible**: Works in any environment without configuration
- **Developer-friendly**: Beautiful output and clickable source links
- **Production-ready**: JSON output for log aggregation systems

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=guiiai/logg&type=Date)](https://star-history.com/#guiiai/logg&Date)

## Contributors

[![contributors](https://contrib.rocks/image?repo=guiiai/logg)](https://github.com/guiiai/logg/graphs/contributors)

### Made with ❤
