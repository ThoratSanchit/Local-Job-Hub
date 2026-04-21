import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import MessageController from '../controllers/message.controller';
import { verifyToken } from '../middlewares/verifyToken';

const messageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);
  fastify.post('/:jobId/messages', MessageController.send);
  fastify.get('/:jobId/messages', MessageController.getMessages);
};

export default messageRoutes;
