import { FastifyRequest, FastifyReply } from 'fastify';
import JobResponseService from '../services/jobResponse.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';

class JobResponseController {
  async getResponses(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId } = req.params;

      const responses = await JobResponseService.getResponses(userId, jobId);
      return reply.code(200).send({ data: responses });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async acceptWorker(req: FastifyRequest<{ Params: { jobId: string; responseId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId, responseId } = req.params;

      const result = await JobResponseService.acceptWorker(userId, jobId, responseId);
      return reply.code(200).send(result);
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async rejectWorker(req: FastifyRequest<{ Params: { jobId: string; responseId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId, responseId } = req.params;

      const result = await JobResponseService.rejectWorker(userId, jobId, responseId);
      return reply.code(200).send(result);
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new JobResponseController();
