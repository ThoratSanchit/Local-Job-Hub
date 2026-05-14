import { FastifyInstance } from 'fastify';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import jobRoutes from './job.route';
import messageRoutes from './message.route';
import reviewRoutes from './review.route';
import notificationRoutes from './notification.route';

export const registerRoutes = async (fastify: FastifyInstance) => {
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(userRoutes, { prefix: '/api/users' });
  fastify.register(jobRoutes, { prefix: '/api/jobs' });
  fastify.register(messageRoutes, { prefix: '/api/messages' });
  fastify.register(reviewRoutes, { prefix: '/api/jobs' });  // Same prefix as jobs
  fastify.register(notificationRoutes, { prefix: '/api/notifications' });
};
