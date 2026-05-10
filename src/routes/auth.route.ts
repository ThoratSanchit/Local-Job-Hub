import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import AuthController from '../controllers/auth.controller';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/signup/send-otp', AuthController.sendSignupOtp);
  fastify.post('/signup/verify-otp', AuthController.verifySignupOtp);
  fastify.post('/signup', AuthController.signup);
  fastify.post('/login/send-otp', AuthController.sendLoginOtp);
  fastify.post('/login', AuthController.login);
  fastify.post('/upload-profile-photo', AuthController.uploadProfilePhoto);
};

export default authRoutes;
