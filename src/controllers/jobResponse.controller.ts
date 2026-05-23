import { FastifyRequest, FastifyReply } from 'fastify';
import JobResponseService from '../services/jobResponse.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';

class JobResponseController {
  async getResponses(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId } = req.params;

      const result = await JobResponseService.getResponses(userId, jobId);
      return reply.code(200).send({ job: result.job, data: result.workers });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async updateResponseStatus(req: FastifyRequest<{ Params: { jobId: string; responseId: string }; Body: { status: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId, responseId } = req.params;
      const { status } = req.body;

      if (status !== 'ACCEPTED' && status !== 'REJECTED') {
        return reply.code(400).send({ message: "Invalid status. Must be 'ACCEPTED' or 'REJECTED'" });
      }

      let result;
      if (status === 'ACCEPTED') {
        result = await JobResponseService.acceptWorker(userId, jobId, responseId);
      } else {
        result = await JobResponseService.rejectWorker(userId, jobId, responseId);
      }
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
