import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import ReviewController from '../controllers/review.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { submitReviewSchema, submitBulkReviewSchema } from '../schemas/review.schema';

const reviewRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/:jobId/reviews/workers', ReviewController.getAcceptedWorkersForReview);
  fastify.post('/:jobId/reviews', { schema: submitReviewSchema }, ReviewController.submitReview);
  fastify.post('/:jobId/reviews/bulk', { schema: submitBulkReviewSchema }, ReviewController.submitBulkReviews);
};

export default reviewRoutes;
