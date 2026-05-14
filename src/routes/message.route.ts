import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import MessageController from '../controllers/message.controller';
import { verifyToken } from '../middlewares/verifyToken';

const messageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);
  fastify.post('/send', MessageController.send);
  fastify.get('/conversation/:conversationId', MessageController.getMessages);
  fastify.get('/inbox', MessageController.getInbox);
};

export default messageRoutes;
