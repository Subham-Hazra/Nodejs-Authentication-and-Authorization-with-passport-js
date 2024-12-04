import { createLogger, format, transports } from 'winston';
import path from 'path';

// Define custom log levels (optional)
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, stack }: any) => {
    return stack
      ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`
      : `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

// Create the logger
const logger = createLogger({
  levels: customLevels.levels,
  format: logFormat,
  transports: [
    new transports.Console({
      level: 'debug', // Set console log level
      format: format.combine(format.colorize(), logFormat),
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    }),
  ],
  exitOnError: false,
});

// Stream for HTTP logging (e.g., for morgan)
logger.stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
} as any;

export default logger;
