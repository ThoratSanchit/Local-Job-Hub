import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import JobController from '../controllers/job.controller';
import JobResponseController from '../controllers/jobResponse.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { createJobSchema, updateJobSchema } from '../schemas/job.schema';

const jobRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', verifyToken);

  fastify.post('/', { schema: createJobSchema }, JobController.createJob);
  fastify.get('/', JobController.getJobs);
  fastify.get('/posted', JobController.getMyPostedJobs);
  fastify.get('/accepted', JobController.getMyAcceptedJobs);
  fastify.get('/applied', JobController.getMyApplications);
  fastify.get('/:id', JobController.getJobById);
  fastify.put('/:id', { schema: updateJobSchema }, JobController.updateJob);
  fastify.put('/:id/cancel', JobController.cancelJob);
  fastify.put('/:id/complete', JobController.completeJob);
  fastify.post('/:jobId/respond', JobResponseController.respond);
  fastify.get('/:jobId/responses', JobResponseController.getResponses);
  fastify.put('/:jobId/responses/:responseId/accept', JobResponseController.acceptWorker);
  fastify.put('/:jobId/responses/:responseId/reject', JobResponseController.rejectWorker);
};

export default jobRoutes;
