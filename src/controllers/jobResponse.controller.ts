import { FastifyRequest, FastifyReply } from 'fastify';
import JobResponseRepository from '../repositories/jobResponse.repository';
import JobRepository from '../repositories/job.repository';
import { JobStatus } from '../models/job.model';
import { ResponseStatus } from '../models/jobResponse.model';
import Messages from '../language/en/message.language';
import { notify } from '../utility/notification.utility';
import { NotificationType } from '../models/notification.model';

class JobResponseController {
  async respond(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
    try {
      const workerId = (req as any).user.id;
      const { jobId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.created_by === workerId) return reply.code(400).send({ message: Messages.CANNOT_RESPOND_OWN_JOB });
      if (new Date(j.expires_at) < new Date()) return reply.code(400).send({ message: Messages.JOB_EXPIRED });

      const openStatuses: JobStatus[] = [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED];
      if (!openStatuses.includes(j.status)) return reply.code(400).send({ message: Messages.JOB_NOT_OPEN });

      const existing = await JobResponseRepository.findByJobAndWorker(jobId, workerId);
      if (existing) return reply.code(409).send({ message: Messages.RESPONSE_ALREADY_EXISTS });

      const response = await JobResponseRepository.create({ job_id: jobId, worker_id: workerId });

      await notify({
        user_id: j.created_by,
        type: NotificationType.NEW_RESPONSE,
        title: 'New Worker Response',
        body: 'Someone responded to your job.',
        meta: { job_id: jobId },
      });

      return reply.code(201).send({ message: Messages.RESPONSE_SUBMITTED, data: response });
    } catch (err: any) {
      // DB-level unique constraint violation (race condition fallback)
      if (err?.name === 'SequelizeUniqueConstraintError') {
        return reply.code(409).send({ message: Messages.RESPONSE_ALREADY_EXISTS });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getResponses(req: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });
      if ((job as any).created_by !== userId) return reply.code(403).send({ message: Messages.JOB_UNAUTHORIZED });

      const responses = await JobResponseRepository.findByJob(jobId);
      return reply.code(200).send({ data: responses });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async acceptWorker(req: FastifyRequest<{ Params: { jobId: string; responseId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId, responseId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.created_by !== userId) return reply.code(403).send({ message: Messages.JOB_UNAUTHORIZED });

      const openStatuses: JobStatus[] = [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED];
      if (!openStatuses.includes(j.status)) return reply.code(400).send({ message: Messages.JOB_ALREADY_FULL });

      const response = await JobResponseRepository.findById(responseId);
      if (!response) return reply.code(404).send({ message: Messages.RESPONSE_NOT_FOUND });
      if (response.status !== ResponseStatus.PENDING) return reply.code(400).send({ message: Messages.RESPONSE_NOT_PENDING });

      // Re-check accepted count AFTER fetching response to guard against race conditions
      const acceptedCountBefore = await JobResponseRepository.countAccepted(jobId);
      if (acceptedCountBefore >= j.workers_required) {
        // Another concurrent request already filled the job — reject this one
        await JobResponseRepository.update(responseId, { status: ResponseStatus.REJECTED } as any);
        await JobRepository.update(jobId, { status: JobStatus.FULL } as any);
        await JobResponseRepository.rejectAllPending(jobId);
        return reply.code(400).send({ message: Messages.JOB_ALREADY_FULL });
      }

      await JobResponseRepository.update(responseId, { status: ResponseStatus.ACCEPTED } as any);

      // Re-count after accepting to determine new job status
      const acceptedCount = await JobResponseRepository.countAccepted(jobId);
      let newStatus: JobStatus;

      if (acceptedCount >= j.workers_required) {
        newStatus = JobStatus.FULL;
        await JobRepository.update(jobId, { status: newStatus } as any);
        await JobResponseRepository.rejectAllPending(jobId);
      } else {
        newStatus = JobStatus.PARTIALLY_ACCEPTED;
        await JobRepository.update(jobId, { status: newStatus } as any);
      }

      await notify({
        user_id: response.worker_id,
        type: NotificationType.WORKER_ACCEPTED,
        title: 'You were accepted!',
        body: `You have been accepted for the job "${j.title}".`,
        meta: { job_id: jobId },
      });

      return reply.code(200).send({ message: Messages.WORKER_ACCEPTED, job_status: newStatus });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async rejectWorker(req: FastifyRequest<{ Params: { jobId: string; responseId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { jobId, responseId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });
      if ((job as any).created_by !== userId) return reply.code(403).send({ message: Messages.JOB_UNAUTHORIZED });

      const response = await JobResponseRepository.findById(responseId);
      if (!response) return reply.code(404).send({ message: Messages.RESPONSE_NOT_FOUND });
      if (response.status !== ResponseStatus.PENDING) return reply.code(400).send({ message: Messages.RESPONSE_NOT_PENDING });

      await JobResponseRepository.update(responseId, { status: ResponseStatus.REJECTED } as any);
      return reply.code(200).send({ message: Messages.WORKER_REJECTED });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new JobResponseController();
