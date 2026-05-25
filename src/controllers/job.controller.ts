import { FastifyRequest, FastifyReply } from 'fastify';
import JobService from '../services/job.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import {
  ICancelJobRequest,
  ICreateJobRequest,
  IGetJobsQuery,
  IJobParams,
  IUpdateJobRequest,
} from '../interfaces/job.interface';

class JobController {
  async createJob(req: FastifyRequest<{ Body: ICreateJobRequest }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const job = await JobService.createJob(userId, req.body);

      return reply.code(201).send({
        statusCode: 201,
        message: Messages.JOB_CREATED,
        data: job,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getJobs(req: FastifyRequest<{ Querystring: IGetJobsQuery }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const limit = Number(req.query.limit || 10);
      const result = await JobService.getJobs(userId, {
        limit,
        cursor: req.query.cursor,
      });

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOBS_FETCHED,
        data: result.jobs,
        pagination: result.pagination,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getJobById(req: FastifyRequest<{ Params: IJobParams }>, reply: FastifyReply) {
    try {
      const job = await JobService.getJobById(req.params.id);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOB_FETCHED,
        data: job,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async updateJob(req: FastifyRequest<{ Params: IJobParams; Body: IUpdateJobRequest }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const job = await JobService.updateJob(userId, req.params.id, req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOB_UPDATED,
        data: job,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async cancelJob(req: FastifyRequest<{ Params: IJobParams; Body: ICancelJobRequest }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      await JobService.cancelJob(userId, req.params.id, req.body?.reason);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOB_CANCELLED
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async completeJob(req: FastifyRequest<{ Params: IJobParams }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      await JobService.completeJob(userId, req.params.id);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOB_COMPLETED
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getMyPostedJobs(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const jobs = await JobService.getMyPostedJobs(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOBS_FETCHED,
        data: jobs,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getMyAcceptedJobs(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const responses = await JobService.getMyAcceptedJobs(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOBS_FETCHED,
        data: responses,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getMyApplications(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const applications = await JobService.getMyApplications(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOBS_FETCHED,
        data: applications,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async searchJobs(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const jobs = await JobService.searchJobs(userId, req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.JOBS_FETCHED,
        data: jobs,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getRecentSearches(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const searches = await JobService.getRecentSearches(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.RECENT_SEARCHES_FETCHED,
        data: searches,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async applyJob(req: FastifyRequest<{ Params: IJobParams }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const response = await JobService.applyJob(userId, req.params.id);

      return reply.code(201).send({
        statusCode: 201,
        message: Messages.RESPONSE_SUBMITTED,
        data: response,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export default new JobController();
