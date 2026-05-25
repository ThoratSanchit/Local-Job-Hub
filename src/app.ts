import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { initializeSequelize, checkDatabaseConnection, sequelize } from './config/instance';
import { setupAssociations } from './models/associations';
import { startExpiryScheduler } from './utility/expiry.utility';
import { registerRoutes } from './routes/index';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      message: error.message,
    });
  }

  fastify.log.error(error);
  reply.status(500).send({
    statusCode: 500,
    message: 'Something broke!',
  });
});

fastify.get('/health', async (request, reply) => {
  const dbStatus = await checkDatabaseConnection();
  const isHealthy = dbStatus.connected;

  return reply.status(isHealthy ? 200 : 503).send({
    status: isHealthy ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message
    }
  });
});

export const init = async () => {
  await initializeSequelize();
  const dbStatus = await checkDatabaseConnection();
  console.log('DB status:', dbStatus);

  if (!dbStatus.connected) throw new Error(dbStatus.message);

  // Setup model associations before sync
  setupAssociations();

  // Register routes
  await registerRoutes(fastify);

  await sequelize.sync();
  console.log('Database tables synced successfully.');

  startExpiryScheduler();
  return fastify;
};

const start = async () => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await init();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export { fastify };

