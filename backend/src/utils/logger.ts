import pino from "pino";

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      colorize: true,
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
    }
  },
});

export default logger;
