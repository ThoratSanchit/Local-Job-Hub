import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initializeSequelize, checkDatabaseConnection, sequelize } from './config/instance';
import { setupAssociations } from './models/associations';
import { startExpiryScheduler } from './utility/expiry.utility';

dotenv.config();

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Something broke!' });
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
    const authRoutes = require('./routes/auth.route').default;
    const userRoutes = require('./routes/user.route').default;
    const jobRoutes = require('./routes/job.route').default;
    const messageRoutes = require('./routes/message.route').default;
    const reviewRoutes = require('./routes/review.route').default;
    const notificationRoutes = require('./routes/notification.route').default;

    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(userRoutes, { prefix: '/api/users' });
    fastify.register(jobRoutes, { prefix: '/api/jobs' });
    fastify.register(messageRoutes, { prefix: '/api/jobs' });
    fastify.register(reviewRoutes, { prefix: '/api/jobs' });
    fastify.register(notificationRoutes, { prefix: '/api/notifications' });

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
