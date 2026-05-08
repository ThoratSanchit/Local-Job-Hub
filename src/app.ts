import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initializeSequelize, checkDatabaseConnection, sequelize } from './config/instance';
import { setupAssociations } from './models/associations';
import { startExpiryScheduler } from './utility/expiry.utility';
import { registerRoutes } from './routes/index';

dotenv.config();

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

const start = async () => {
  try {
    await initializeSequelize();
    const dbStatus = await checkDatabaseConnection();
    console.log('DB status:', dbStatus);

    if (!dbStatus.connected) throw new Error(dbStatus.message);

    // Setup model associations before sync
    setupAssociations();

    // Register routes
    await registerRoutes(fastify);

    await sequelize.sync({ alter: true });
    console.log('Database tables synced successfully.');

    startExpiryScheduler();

    await fastify.listen({ port: PORT });
    fastify.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
