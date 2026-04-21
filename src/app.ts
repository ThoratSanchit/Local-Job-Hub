import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initializeSequelize, checkDatabaseConnection, sequelize } from './config/instance';

dotenv.config();

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Basic error handler
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Something broke!' });
});

const start = async () => {
    try {
        await initializeSequelize();
        const dbStatus = await checkDatabaseConnection();
        console.log('DB status:', dbStatus);

        if (!dbStatus.connected) {
            throw new Error(dbStatus.message);
        }

        // Register Routes (deferred require so models get initialized AFTER sequelize)
        const userRoutes = require('./routes/user.route').default;
        fastify.register(userRoutes, { prefix: '/api/users' });

        // Auto-create/alter tables using sequelize.sync
        await sequelize.sync({ alter: true });
        console.log('Database tables synced successfully.');

        await fastify.listen({ port: PORT });
        fastify.log.info(`Server is running on port ${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
