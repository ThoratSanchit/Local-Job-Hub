import { FastifyRequest, FastifyReply } from 'fastify';
import ReviewRepository from '../repositories/review.repository';
import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import UserRepository from '../repositories/user.repository';
import { JobStatus } from '../models/job.model';
import Messages from '../language/en/message.language';

class ReviewController {
  async submitReview(
    req: FastifyRequest<{ Params: { jobId: string }; Body: { worker_id: string; rating: number; comment?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const reviewerId = (req as any).user.id;
      const { jobId } = req.params;
      const { worker_id, rating, comment } = req.body;

      // Validate rating range
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return reply.code(400).send({ message: 'Rating must be an integer between 1 and 5' });
      }

      if (reviewerId === worker_id) return reply.code(400).send({ message: Messages.CANNOT_REVIEW_SELF });

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.status !== JobStatus.COMPLETED) return reply.code(400).send({ message: Messages.JOB_NOT_COMPLETED });
      if (j.created_by !== reviewerId) return reply.code(403).send({ message: Messages.NOT_JOB_CREATOR });

      // Verify worker was actually accepted for this job
      const workerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
      if (!workerIds.includes(worker_id)) {
        return reply.code(400).send({ message: 'Worker was not accepted for this job' });
      }

      // One review per (job + reviewer + worker) — creator can review each worker once
      const existing = await ReviewRepository.findExisting(jobId, reviewerId, worker_id);
      if (existing) return reply.code(409).send({ message: Messages.REVIEW_ALREADY_EXISTS });

      await ReviewRepository.create({ job_id: jobId, reviewer_id: reviewerId, worker_id, rating, comment });

      // Recalculate worker stats from all reviews
      const stats = await ReviewRepository.getWorkerStats(worker_id);
      const completedJobCount = await JobResponseRepository.countCompletedJobsForWorker(worker_id);

      // completion_rate = completed jobs / total accepted jobs (as a percentage)
      const totalAccepted = await JobResponseRepository.countAccepted(worker_id);
      const completion_rate = totalAccepted > 0
        ? Math.round((completedJobCount / totalAccepted) * 100)
        : 0;

      await UserRepository.updateUser(worker_id, {
        rating: stats.avg,
        total_jobs_completed: completedJobCount,
        completion_rate,
      } as any);

      return reply.code(201).send({ message: Messages.REVIEW_SUBMITTED });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new ReviewController();
