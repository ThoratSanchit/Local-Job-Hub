import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import JobController from '../controllers/job.controller';
import JobResponseController from '../controllers/jobResponse.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { createJobSchema, updateJobSchema, filterJobSchema, getJobsSchema } from '../schemas/job.schema';

const jobRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', verifyToken);

  fastify.post('/', { schema: createJobSchema }, JobController.createJob);
  fastify.post('/filter', { schema: filterJobSchema }, JobController.filterJobs);
  fastify.get('/', { schema: getJobsSchema }, JobController.getJobs);
  fastify.get('/posted', JobController.getMyPostedJobs);
  fastify.get('/accepted', JobController.getMyAcceptedJobs);
  fastify.get('/applied', JobController.getMyApplications);
  fastify.post('/:id/apply', JobController.applyJob);
  fastify.get('/:id', JobController.getJobById);
  fastify.put('/:id', { schema: updateJobSchema }, JobController.updateJob);
  fastify.put('/:id/cancel', JobController.cancelJob);
  fastify.put('/:id/complete', JobController.completeJob);
  fastify.get('/:jobId/responses', JobResponseController.getResponses);
  fastify.put('/:jobId/responses/:responseId/status', JobResponseController.updateResponseStatus);
};

export default jobRoutes;
