import { FastifyRequest, FastifyReply } from 'fastify';
import JobRepository from '../repositories/job.repository';
import UserRepository from '../repositories/user.repository';
import { JobStatus } from '../models/job.model';
import Messages from '../language/en/message.language';
import { notify, notifyMany } from '../utility/notification.utility';
import { NotificationType } from '../models/notification.model';
import User from '../models/user.model';
import { Op } from 'sequelize';

class JobController {
  async createJob(req: FastifyRequest<{ Body: { title: string; description: string; category: string; price: number; workers_required?: number; urgent?: boolean; expires_at?: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const { title, description, category, price, workers_required, urgent, expires_at: userExpiresAt } = req.body;

      if (!title?.trim() || !description?.trim() || !category?.trim()) {
        return reply.code(400).send({ message: 'title, description, and category are required' });
      }
      if (typeof price !== 'number' || price <= 0) {
        return reply.code(400).send({ message: 'price must be a positive number' });
      }
      if (workers_required !== undefined && (!Number.isInteger(workers_required) || workers_required < 1)) {
        return reply.code(400).send({ message: 'workers_required must be a positive integer' });
      }

      // Validate optional expires_at
      let expires_at: Date | null = null;
      if (userExpiresAt) {
        const parsed = new Date(userExpiresAt);
        if (isNaN(parsed.getTime())) {
          return reply.code(400).send({ message: 'expires_at must be a valid ISO date string' });
        }
        if (parsed.getTime() <= Date.now()) {
          return reply.code(400).send({ message: 'expires_at must be in the future' });
        }
        expires_at = parsed;
      }

      const creator = await UserRepository.findById(userId);
      if (!creator) return reply.code(404).send({ message: Messages.USER_NOT_FOUND });

      const job = await JobRepository.create({
        title,
        description,
        category,
        price,
        city: (creator as any).city,
        area: (creator as any).area,
        created_by: userId,
        workers_required: workers_required || 1,
        urgent: !!urgent,
        expires_at,
        status: JobStatus.OPEN,
      });

      // Notify nearby users (same city+area, excluding creator)
      const nearbyUsers = await User.findAll({
        where: {
          city: (creator as any).city,
          area: (creator as any).area,
          id: { [Op.ne]: userId },
        },
        attributes: ['id'],
      });
      const ids = nearbyUsers.map((u) => u.id);
      if (ids.length) {
        await notifyMany(ids, NotificationType.JOB_CREATED, 'New Job Near You', `${title} — ₹${price}`, { job_id: (job as any).id });
      }

      return reply.code(201).send({ message: Messages.JOB_CREATED, data: job });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getJobs(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const user = await UserRepository.findById(userId);
      if (!user) return reply.code(404).send({ message: Messages.USER_NOT_FOUND });

      const jobs = await JobRepository.findByLocation((user as any).city, (user as any).area);
      return reply.code(200).send({ message: Messages.JOBS_FETCHED, data: jobs });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getJobById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const job = await JobRepository.findById(req.params.id);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });
      return reply.code(200).send({ message: Messages.JOB_FETCHED, data: job });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async cancelJob(req: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const job = await JobRepository.findById(req.params.id);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });
      if ((job as any).created_by !== userId) return reply.code(403).send({ message: Messages.JOB_UNAUTHORIZED });

      const terminal: JobStatus[] = [JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.EXPIRED];
      if (terminal.includes((job as any).status)) {
        return reply.code(400).send({ message: 'Job cannot be cancelled in its current state' });
      }

      await JobRepository.update(req.params.id, {
        status: JobStatus.CANCELLED,
        cancelled_by: userId,
        cancellation_reason: req.body?.reason || null,
      } as any);

      // Notify accepted workers
      const { default: JobResponseRepo } = await import('../repositories/jobResponse.repository');
      const workerIds = await JobResponseRepo.findAcceptedWorkerIds(req.params.id);
      if (workerIds.length) {
        await notifyMany(workerIds, NotificationType.JOB_CANCELLED, 'Job Cancelled', `The job "${(job as any).title}" has been cancelled.`, { job_id: req.params.id });
      }

      return reply.code(200).send({ message: Messages.JOB_CANCELLED });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async completeJob(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const job = await JobRepository.findById(req.params.id);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });
      if ((job as any).created_by !== userId) return reply.code(403).send({ message: Messages.JOB_UNAUTHORIZED });
      if (!([JobStatus.FULL, JobStatus.PARTIALLY_ACCEPTED] as JobStatus[]).includes((job as any).status)) {
        return reply.code(400).send({ message: 'Job must be FULL or PARTIALLY_ACCEPTED to complete' });
      }

      await JobRepository.update(req.params.id, { status: JobStatus.COMPLETED } as any);

      const { default: JobResponseRepo } = await import('../repositories/jobResponse.repository');
      const workerIds = await JobResponseRepo.findAcceptedWorkerIds(req.params.id);
      const allIds = [...new Set([...workerIds, userId])];
      await notifyMany(allIds, NotificationType.JOB_COMPLETED, 'Job Completed', `The job "${(job as any).title}" has been marked as completed.`, { job_id: req.params.id });

      return reply.code(200).send({ message: Messages.JOB_COMPLETED });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new JobController();
