import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import AuthController from '../controllers/auth.controller';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/send-otp', AuthController.sendOtp);
  fastify.post('/verify-otp', AuthController.verifyOtp);
  fastify.post('/signup', AuthController.signup);
  fastify.post('/upload-profile-photo', AuthController.uploadProfilePhoto);
};

export default authRoutes;
