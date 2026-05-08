import { FastifyRequest, FastifyReply } from 'fastify';
import UserRepository from '../repositories/user.repository';
import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import Messages from '../language/en/message.language';
import { AvailabilityStatus } from '../enums/availability.status.enum';

class UserController {
  async getMe(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const user = await UserRepository.findById(userId);
      if (!user) return reply.code(404).send({ message: Messages.USER_NOT_FOUND });
      return reply.code(200).send({ message: Messages.USER_FETCHED_SUCCESSFULLY, data: user });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const user = await UserRepository.findById(req.params.id);
      if (!user) return reply.code(404).send({ message: Messages.USER_NOT_FOUND });
      return reply.code(200).send({ message: Messages.USER_FETCHED_SUCCESSFULLY, data: user });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async updateProfile(
    req: FastifyRequest<{ Body: { name?: string; city?: string; area?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (req as any).user.id;
      const { name, city, area } = req.body;
      await UserRepository.updateUser(userId, { name, city, area } as any);
      return reply.code(200).send({ message: Messages.USER_UPDATED_SUCCESSFULLY });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async toggleAvailability(
    req: FastifyRequest<{ Body: { availability_status: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (req as any).user.id;
      const { availability_status } = req.body;

      const validStatuses = Object.values(AvailabilityStatus) as string[];
      if (!validStatuses.includes(availability_status)) {
        return reply.code(400).send({
          message: `Invalid availability_status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      await UserRepository.updateUser(userId, { availability_status } as any);
      return reply.code(200).send({ message: Messages.AVAILABILITY_UPDATED, availability_status });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  // Jobs posted by the logged-in user
  async getMyPostedJobs(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const jobs = await JobRepository.findByCreator(userId);
      return reply.code(200).send({ message: Messages.JOBS_FETCHED, data: jobs });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  // Jobs the logged-in user was accepted as a worker for
  async getMyAcceptedJobs(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const responses = await JobResponseRepository.findByWorkerAccepted(userId);
      return reply.code(200).send({ message: Messages.JOBS_FETCHED, data: responses });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new UserController();
