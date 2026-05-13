import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import UserController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', verifyToken);

  fastify.get('/me', UserController.getMe);
  fastify.get('/me/jobs/posted', UserController.getMyPostedJobs);
  fastify.get('/me/jobs/accepted', UserController.getMyAcceptedJobs);
  fastify.get('/:id', UserController.getUser);
  fastify.put('/me', UserController.updateProfile);
  fastify.patch('/me/availability', UserController.toggleAvailability);
};

export default userRoutes;
