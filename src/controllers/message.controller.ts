import { FastifyRequest, FastifyReply } from 'fastify';
import MessageRepository from '../repositories/message.repository';
import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import { JobStatus } from '../constants/job.constants';
import Messages from '../language/en/message.language';

// States where messaging is allowed
const MESSAGEABLE_STATUSES: JobStatus[] = [
  JobStatus.PARTIALLY_ACCEPTED,
  JobStatus.FULL,
  JobStatus.COMPLETED,
];

class MessageController {
  async send(
    req: FastifyRequest<{ Params: { jobId: string }; Body: { receiver_id: string; content: string } }>,
    reply: FastifyReply
  ) {
    try {
      const senderId = (req as any).user.id;
      const { jobId } = req.params;
      const { receiver_id, content } = req.body;

      if (!content?.trim()) {
        return reply.code(400).send({ message: 'Message content cannot be empty' });
      }

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;

      if (j.status === JobStatus.CANCELLED || j.status === JobStatus.EXPIRED) {
        return reply.code(400).send({ message: 'Cannot send messages on a cancelled or expired job' });
      }

      if (!MESSAGEABLE_STATUSES.includes(j.status)) {
        return reply.code(400).send({ message: 'Messaging is only available once a worker has been accepted' });
      }

      const acceptedWorkerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
      const participants = [j.created_by, ...acceptedWorkerIds];

      if (!participants.includes(senderId)) {
        return reply.code(403).send({ message: Messages.NOT_PARTICIPANT });
      }
      if (!participants.includes(receiver_id)) {
        return reply.code(403).send({ message: 'Receiver is not a participant in this job' });
      }
      if (senderId === receiver_id) {
        return reply.code(400).send({ message: 'Cannot send a message to yourself' });
      }

      const msg = await MessageRepository.create({ job_id: jobId, sender_id: senderId, receiver_id, content: content.trim() });
      return reply.code(201).send({ message: Messages.MESSAGE_SENT, data: msg });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getMessages(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      const acceptedWorkerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
      const participants = [j.created_by, ...acceptedWorkerIds];

      if (!participants.includes(userId)) {
        return reply.code(403).send({ message: Messages.NOT_PARTICIPANT });
      }

      const msgs = await MessageRepository.findByJob(jobId);
      return reply.code(200).send({ message: Messages.MESSAGES_FETCHED, data: msgs });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new MessageController();
