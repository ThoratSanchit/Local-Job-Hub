import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import JobController from '../controllers/job.controller';
import JobResponseController from '../controllers/jobResponse.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { createJobSchema } from '../schemas/job.schema';

const jobRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
  fastify.addHook('preHandler', verifyToken);

  // Jobs
  fastify.post('/', { schema: createJobSchema }, JobController.createJob);
  fastify.get('/', JobController.getJobs);
  fastify.get('/:id', JobController.getJobById);
  fastify.patch('/:id/cancel', JobController.cancelJob);
  fastify.patch('/:id/complete', JobController.completeJob);

  // Responses
  fastify.post('/:jobId/respond', JobResponseController.respond);
  fastify.get('/:jobId/responses', JobResponseController.getResponses);
  fastify.patch('/:jobId/responses/:responseId/accept', JobResponseController.acceptWorker);
  fastify.patch('/:jobId/responses/:responseId/reject', JobResponseController.rejectWorker);
};

export default jobRoutes;
