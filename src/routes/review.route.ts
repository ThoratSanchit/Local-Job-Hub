import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import ReviewController from '../controllers/review.controller';
import { verifyToken } from '../middlewares/verifyToken';

const reviewRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);
  fastify.post('/:jobId/reviews', ReviewController.submitReview);
};

export default reviewRoutes;
