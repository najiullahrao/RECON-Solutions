import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import app from './app.js';

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Server running');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
