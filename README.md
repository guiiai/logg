# Logg

Yet another simple, nearly zero dependency, structural log compliance logger implementation for NodeJS.

## Features

- Stack Parse: Automatically captures and includes stack trace information for enhanced debugging.
- Caller Records: Provides detailed information about the calling function and file.
- JSON Format & stdout: Outputs logs in JSON format to stdout for easy parsing and integration with log management tools.
- Drop-in Replacement for Winston: Can be used as a direct replacement for the popular Winston logger.
- Best Practices for Structural Logging: Implements industry best practices for structured logging.
- Intuitive API: Simple and easy-to-use API for quick integration into your projects.

## Usage

```javascript
const { createLogg } = require('logg');

// Create a logger instance with a specific context
const log = createLogg('http/request').useGlobalConfig();

// Log a 404 error with additional fields
log
  .withField('requestId', req.id)
  .withField('url', req.url)
  .error('Resource not found (404)');
```
