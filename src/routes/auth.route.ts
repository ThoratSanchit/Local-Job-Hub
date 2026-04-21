import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import AuthController from '../controllers/auth.controller';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.post('/signup', AuthController.signup);
  fastify.post('/login', AuthController.login);
};

export default authRoutes;
