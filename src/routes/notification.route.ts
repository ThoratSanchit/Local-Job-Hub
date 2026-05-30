import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import NotificationController from '../controllers/notification.controller';
import { verifyToken } from '../middlewares/verifyToken';

const notificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', NotificationController.getNotifications);
  fastify.get('/unread-count', NotificationController.getUnreadCount);
  fastify.put('/:id/read', NotificationController.markRead);
};

export default notificationRoutes;
