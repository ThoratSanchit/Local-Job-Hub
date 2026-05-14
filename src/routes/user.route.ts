import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import UserController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', verifyToken);

  fastify.get('/me', (req, reply) => UserController.getMe(req, reply));
  fastify.get<{ Params: { id: string } }>('/:id', (req, reply) => UserController.getUser(req, reply));
  fastify.put('/me', (req, reply) => UserController.updateProfile(req as any, reply));
  fastify.patch('/me/availability', (req, reply) => UserController.toggleAvailability(req as any, reply));
};

export default userRoutes;
