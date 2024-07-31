'use strict';

const colorette = require('colorette');

var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Error"] = 0] = "Error";
  LogLevel2[LogLevel2["Warning"] = 1] = "Warning";
  LogLevel2[LogLevel2["Log"] = 2] = "Log";
  LogLevel2[LogLevel2["Verbose"] = 3] = "Verbose";
  LogLevel2[LogLevel2["Debug"] = 4] = "Debug";
  return LogLevel2;
})(LogLevel || {});
var LogLevelString = /* @__PURE__ */ ((LogLevelString2) => {
  LogLevelString2["Error"] = "error";
  LogLevelString2["Warning"] = "warn";
  LogLevelString2["Log"] = "log";
  LogLevelString2["Verbose"] = "verbose";
  LogLevelString2["Debug"] = "debug";
  return LogLevelString2;
})(LogLevelString || {});
var Format = /* @__PURE__ */ ((Format2) => {
  Format2["JSON"] = "json";
  Format2["Pretty"] = "pretty";
  return Format2;
})(Format || {});

const logLevelStringToLogLevelMap = {
  [LogLevelString.Error]: LogLevel.Error,
  [LogLevelString.Warning]: LogLevel.Warning,
  [LogLevelString.Log]: LogLevel.Log,
  [LogLevelString.Verbose]: LogLevel.Verbose,
  [LogLevelString.Debug]: LogLevel.Debug
};
const logLevelToLogLevelStringMap = {
  [LogLevel.Error]: LogLevelString.Error,
  [LogLevel.Warning]: LogLevelString.Warning,
  [LogLevel.Log]: LogLevelString.Log,
  [LogLevel.Verbose]: LogLevelString.Verbose,
  [LogLevel.Debug]: LogLevelString.Debug
};
const availableLogLevelStrings = [
  LogLevelString.Error,
  LogLevelString.Warning,
  LogLevelString.Log,
  LogLevelString.Verbose,
  LogLevelString.Debug
];
const logLevelToChalkColorMap = {
  [LogLevel.Error]: colorette.red,
  [LogLevel.Warning]: colorette.yellow,
  [LogLevel.Log]: colorette.blue,
  [LogLevel.Verbose]: colorette.cyan,
  [LogLevel.Debug]: colorette.green
};
const availableLogLevels = [
  LogLevel.Error,
  LogLevel.Warning,
  LogLevel.Log,
  LogLevel.Verbose,
  LogLevel.Debug
];
function shouldOutputDebugLevelLogWhenLogLevelIsOneOf(logLevel) {
  return logLevel >= LogLevel.Debug;
}
function shouldOutputVerboseLevelLogWhenLogLevelIsOneOf(logLevel) {
  return logLevel >= LogLevel.Verbose;
}
function shouldOutputLogLevelLogWhenLogLevelIsOneOf(logLevel) {
  return logLevel >= LogLevel.Log;
}
function shouldOutputWarningLevelLogWhenLogLevelIsOneOf(logLevel) {
  return logLevel >= LogLevel.Warning;
}
function shouldOutputErrorLevelLogWhenLogLevelIsOneOf(logLevel) {
  return logLevel >= LogLevel.Error;
}
const availableFormats = [Format.JSON, Format.Pretty];

function isErrorLike(err) {
  if (err == null) {
    return false;
  }
  if (err instanceof Error) {
    return true;
  }
  if (typeof err === "object") {
    if ("message" in err) {
      return true;
    }
  }
  return false;
}
function newLog(logLevel, context, fields, message, ...optionalParams) {
  let fieldsObj = { context: "" };
  if (typeof fields !== "undefined" && fields !== null) {
    fieldsObj = { ...fields };
  }
  if (typeof context !== "undefined" && context !== null) {
    fieldsObj.context = context;
  }
  let messageString = "";
  if (optionalParams != null && optionalParams.length > 0) {
    messageString = [message, ...optionalParams].join(" ");
  } else {
    messageString = message;
  }
  const raw = {
    "@timestamp": (/* @__PURE__ */ new Date()).toISOString(),
    "level": logLevel,
    "fields": fieldsObj,
    "message": messageString
  };
  return raw;
}
function newErrorLog(logLevel, context, fields, message, errorStack, ...optionalParams) {
  const log = newLog(logLevel, context, fields, message, ...optionalParams);
  if (typeof errorStack !== "undefined" && errorStack !== null) {
    log.errored = true;
    log.error = { stack: errorStack };
  }
  return log;
}
function toPrettyString(log) {
  const messagePartials = [];
  messagePartials.push(log["@timestamp"]);
  messagePartials.push(
    logLevelToChalkColorMap[logLevelStringToLogLevelMap[log.level]](
      `[${log.level}]`
    )
  );
  let contextString = "";
  if (log.fields.isNestSystemModule != null) {
    contextString = colorette.magenta(`[${log.fields.nestSystemModule}]`);
    delete log.fields.isNestSystemModule;
    delete log.fields.nestSystemModule;
  }
  if (log.fields.context != null) {
    contextString = colorette.magenta(`[${log.fields.context}]`);
    delete log.fields.context;
  }
  if (contextString.length > 0) {
    messagePartials.push(contextString);
  }
  if ("module" in log.fields && log.fields.module != null) {
    messagePartials.push(colorette.magenta(`[${log.fields.module}]`));
    delete log.fields.module;
  }
  messagePartials.push(log.message);
  const fieldsEntries = Object.entries(log.fields);
  if (fieldsEntries.length > 0) {
    messagePartials.push(" {");
  }
  for (const [key, value] of fieldsEntries) {
    let valueString = value;
    if (isErrorLike(value)) {
      if (value.message) {
        valueString = value.message;
      }
      if (!valueString) {
        valueString = "";
      }
      if (value.cause != null) {
        try {
          valueString += JSON.stringify(value.cause);
        } catch (err) {
          valueString += String(value.cause);
        }
      }
    } else {
      switch (typeof value) {
        case "number":
          valueString = colorette.yellow(value);
          break;
        case "object":
          valueString = colorette.green(JSON.stringify(value));
          break;
        case "boolean":
          valueString = colorette.yellow(String(value));
          break;
        case "undefined":
          valueString = colorette.gray("undefined");
          break;
        default:
          valueString = String(value);
          break;
      }
    }
    messagePartials.push(`${colorette.gray(key)}${colorette.gray("=")}${valueString}`);
  }
  if (fieldsEntries.length > 0) {
    messagePartials.push("}");
  }
  let message = messagePartials.join(" ");
  if (log.errored != null && log.errored && log.error && log.error.stack != null && log.error.stack) {
    message += `
${log.error.stack}`;
  }
  return message;
}

const GLOBAL_CONFIG = {
  configured: false,
  logLevel: LogLevel.Debug,
  format: Format.JSON
};
function getGlobalLogLevel() {
  return GLOBAL_CONFIG.logLevel;
}
function setGlobalLogLevel(logLevel) {
  if (availableLogLevels.includes(logLevel)) {
    GLOBAL_CONFIG.logLevel = logLevel;
  } else {
    throw new Error(
      `log level ${logLevel} is not available. available log levels are: ${availableLogLevels.join(
        ", "
      )}`
    );
  }
  GLOBAL_CONFIG.configured = true;
}
function getGlobalLogLevelString() {
  return logLevelToLogLevelStringMap[GLOBAL_CONFIG.logLevel];
}
function setGlobalLogLevelString(logLevelString) {
  if (availableLogLevelStrings.includes(logLevelString)) {
    GLOBAL_CONFIG.logLevel = logLevelStringToLogLevelMap[logLevelString];
  } else {
    throw new Error(
      `log level ${logLevelString} is not available. available log levels are: ${availableLogLevelStrings.join(
        ", "
      )}`
    );
  }
  GLOBAL_CONFIG.configured = true;
}
function getGlobalFormat() {
  return GLOBAL_CONFIG.format;
}
function setGlobalFormat(format) {
  if (availableFormats.includes(format)) {
    GLOBAL_CONFIG.format = format;
  } else {
    throw new Error(
      `format ${format} is not available. available formats are: ${availableFormats.join(
        ", "
      )}`
    );
  }
  GLOBAL_CONFIG.configured = true;
}
function useLog(context) {
  const logObj = {
    fields: {},
    context,
    logLevel: LogLevel.Debug,
    format: Format.JSON,
    shouldUseGlobalConfig: false,
    useGlobalConfig: () => {
      logObj.shouldUseGlobalConfig = true;
      logObj.format = getGlobalFormat();
      logObj.logLevel = getGlobalLogLevel();
      return logObj.child();
    },
    child: (fields) => {
      const logger = useLog(logObj.context);
      if (typeof fields !== "undefined" || fields !== null) {
        logger.fields = { ...logObj.fields, ...fields };
      } else {
        logger.fields = logObj.fields;
      }
      if (logger.fields != null && "context" in logger.fields) {
        logger.context = logger.fields.context;
      } else {
        logger.context = logObj.context;
      }
      logger.logLevel = logObj.logLevel;
      logger.format = logObj.format;
      logger.shouldUseGlobalConfig = logObj.shouldUseGlobalConfig;
      return logger;
    },
    withContext: (context2) => {
      const logger = logObj.child();
      logger.context = context2;
      return logger;
    },
    withLogLevel: (logLevel) => {
      const logger = logObj.child();
      if (availableLogLevels.includes(logLevel)) {
        logger.logLevel = logLevel;
        logger.debug(
          `setting log level to ${logLevelToLogLevelStringMap[logLevel]} (${logLevel})`
        );
      } else {
        throw new Error(
          `log level ${logLevel} is not available. available log levels are: ${availableLogLevels.join(
            ", "
          )}`
        );
      }
      return logger;
    },
    withLogLevelString: (logLevelString) => {
      const logger = logObj.child();
      if (availableLogLevelStrings.includes(logLevelString)) {
        logger.logLevel = logLevelStringToLogLevelMap[logLevelString];
        logger.debug(
          `setting log level to ${logLevelString} (${logLevelStringToLogLevelMap[logLevelString]})`
        );
      } else {
        throw new Error(
          `log level ${logLevelString} is not available. available log levels are: ${availableLogLevelStrings.join(
            ", "
          )}`
        );
      }
      return logger;
    },
    withFormat: (format) => {
      const logger = logObj.child();
      if (availableFormats.includes(format)) {
        logger.format = format;
        logger.debug(`setting format to ${format}`);
      } else {
        throw new Error(
          `format ${format} is not available. available formats are: ${availableFormats.join(
            ", "
          )}`
        );
      }
      return logger;
    },
    withFields: (fields) => {
      if (typeof fields === "undefined" || fields === null) {
        return logObj.child({});
      }
      return logObj.child(fields);
    },
    withField(key, value) {
      if (typeof key === "undefined" || key === null) {
        throw new Error("key is required");
      }
      return logObj.child({ [key]: value });
    },
    withError: (err) => {
      if (!isErrorLike(err)) {
        return logObj.withField("error", String(err));
      }
      logObj.withField("error", err.message);
      if (err.stack != null) {
        logObj.withField("stack", err.stack);
      }
      if (err.cause != null) {
        try {
          logObj.withField("cause", JSON.stringify(err.cause));
        } catch (_) {
          logObj.withField("cause", String(err.cause));
        }
      }
      return logObj;
    },
    debug(message, ...optionalParams) {
      let logLevel = logObj.logLevel;
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel();
      }
      if (!shouldOutputDebugLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return;
      }
      let format = logObj.format;
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat();
      }
      const raw = newLog(
        LogLevelString.Debug,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        ...optionalParams
      );
      switch (format) {
        case Format.JSON:
          console.debug(JSON.stringify(raw));
          break;
        case Format.Pretty:
          console.debug(toPrettyString(raw));
          break;
        default:
          console.debug(JSON.stringify(raw));
          break;
      }
    },
    verbose(message, ...optionalParams) {
      let logLevel = logObj.logLevel;
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel();
      }
      if (!shouldOutputVerboseLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return;
      }
      let format = logObj.format;
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat();
      }
      const raw = newLog(
        LogLevelString.Verbose,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        ...optionalParams
      );
      switch (format) {
        case Format.JSON:
          console.log(JSON.stringify(raw));
          break;
        case Format.Pretty:
          console.log(toPrettyString(raw));
          break;
        default:
          console.log(JSON.stringify(raw));
          break;
      }
    },
    log(message, ...optionalParams) {
      let logLevel = logObj.logLevel;
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel();
      }
      if (!shouldOutputLogLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return;
      }
      let format = logObj.format;
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat();
      }
      const raw = newLog(
        LogLevelString.Log,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        ...optionalParams
      );
      switch (format) {
        case Format.JSON:
          console.log(JSON.stringify(raw));
          break;
        case Format.Pretty:
          console.log(toPrettyString(raw));
          break;
        default:
          console.log(JSON.stringify(raw));
          break;
      }
    },
    error(message, stack, ...optionalParams) {
      let logLevel = logObj.logLevel;
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel();
      }
      if (!shouldOutputErrorLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return;
      }
      let format = logObj.format;
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat();
      }
      const raw = newErrorLog(
        LogLevelString.Error,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        stack,
        ...optionalParams
      );
      switch (format) {
        case Format.JSON:
          console.error(JSON.stringify(raw));
          break;
        case Format.Pretty:
          console.error(toPrettyString(raw));
          break;
        default:
          console.error(JSON.stringify(raw));
          break;
      }
    },
    errorWithError(message, err, ...optionalParams) {
      return logObj.withError(err).error(message, void 0, ...optionalParams);
    },
    warn(message, ...optionalParams) {
      let logLevel = logObj.logLevel;
      if (logObj.shouldUseGlobalConfig) {
        logLevel = getGlobalLogLevel();
      }
      if (!shouldOutputWarningLevelLogWhenLogLevelIsOneOf(logLevel)) {
        return;
      }
      let format = logObj.format;
      if (logObj.shouldUseGlobalConfig) {
        format = getGlobalFormat();
      }
      const raw = newLog(
        LogLevelString.Warning,
        logObj.context,
        logObj.fields,
        // eslint-disable-next-line ts/no-unsafe-argument
        message,
        ...optionalParams
      );
      switch (format) {
        case Format.JSON:
          console.warn(JSON.stringify(raw));
          break;
        case Format.Pretty:
          console.warn(toPrettyString(raw));
          break;
        default:
          console.warn(JSON.stringify(raw));
          break;
      }
    }
  };
  return logObj;
}

exports.Format = Format;
exports.LogLevel = LogLevel;
exports.LogLevelString = LogLevelString;
exports.availableFormats = availableFormats;
exports.availableLogLevelStrings = availableLogLevelStrings;
exports.availableLogLevels = availableLogLevels;
exports.getGlobalFormat = getGlobalFormat;
exports.getGlobalLogLevel = getGlobalLogLevel;
exports.getGlobalLogLevelString = getGlobalLogLevelString;
exports.isErrorLike = isErrorLike;
exports.logLevelStringToLogLevelMap = logLevelStringToLogLevelMap;
exports.logLevelToChalkColorMap = logLevelToChalkColorMap;
exports.logLevelToLogLevelStringMap = logLevelToLogLevelStringMap;
exports.newErrorLog = newErrorLog;
exports.newLog = newLog;
exports.setGlobalFormat = setGlobalFormat;
exports.setGlobalLogLevel = setGlobalLogLevel;
exports.setGlobalLogLevelString = setGlobalLogLevelString;
exports.shouldOutputDebugLevelLogWhenLogLevelIsOneOf = shouldOutputDebugLevelLogWhenLogLevelIsOneOf;
exports.shouldOutputErrorLevelLogWhenLogLevelIsOneOf = shouldOutputErrorLevelLogWhenLogLevelIsOneOf;
exports.shouldOutputLogLevelLogWhenLogLevelIsOneOf = shouldOutputLogLevelLogWhenLogLevelIsOneOf;
exports.shouldOutputVerboseLevelLogWhenLogLevelIsOneOf = shouldOutputVerboseLevelLogWhenLogLevelIsOneOf;
exports.shouldOutputWarningLevelLogWhenLogLevelIsOneOf = shouldOutputWarningLevelLogWhenLogLevelIsOneOf;
exports.toPrettyString = toPrettyString;
exports.useLog = useLog;
