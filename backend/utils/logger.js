import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize, errors } = format

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`
})

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }),
  ],
})

// Convenience: explicitly log booking / payment events with context
export const logBookingEvent = (event, data) => {
  logger.info(`[BOOKING] ${event} | ${JSON.stringify(data)}`)
}

export const logPaymentEvent = (event, data) => {
  logger.info(`[PAYMENT] ${event} | ${JSON.stringify(data)}`)
}

export default logger
