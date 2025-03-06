// src/utils/logger.ts
import winston from 'winston';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about our custom colors
winston.addColors(colors);

// Define the format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => {
            // Include metadata in the output if it exists
            const metadata = info.meta && Object.keys(info.meta).length
                ? JSON.stringify(info.meta, null, 2)
                : '';
            return `${info.timestamp} ${info.level}: ${info.message} ${metadata}`;
        }
    ),
);

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default to 'info' if not specified
    levels,
    format: winston.format.json(),
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // For production, you might want to add file transports here
    ],
});

// Export a simplified interface to match console.log pattern
export default {
    error: (message: string, ...meta: any[]) => logger.error(message, { meta }),
    warn: (message: string, ...meta: any[]) => logger.warn(message, { meta }),
    info: (message: string, ...meta: any[]) => logger.info(message, { meta }),
    http: (message: string, ...meta: any[]) => logger.http(message, { meta }),
    debug: (message: string, ...meta: any[]) => logger.debug(message, { meta }),
    // Create a log method that maps to info for compatibility with console.log
    log: (message: string, ...meta: any[]) => logger.info(message, { meta }),
};