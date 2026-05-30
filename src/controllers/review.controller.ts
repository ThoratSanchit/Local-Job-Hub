import { FastifyRequest, FastifyReply } from 'fastify';
import ReviewRepository from '../repositories/review.repository';
import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import UserRepository from '../repositories/user.repository';
import { JobStatus } from '../constants/job.constants';
import Messages from '../language/en/message.language';

async function updateWorkerStats(worker_id: string) {
  const stats = await ReviewRepository.getWorkerStats(worker_id);
  const completedJobCount = await JobResponseRepository.countCompletedJobsForWorker(worker_id);

  const totalAccepted = await JobResponseRepository.countAcceptedForWorker(worker_id);
  const completion_rate = totalAccepted > 0
    ? Math.round((completedJobCount / totalAccepted) * 100)
    : 0;

  await UserRepository.updateUser(worker_id, {
    rating: stats.avg,
    total_jobs_completed: completedJobCount,
    completion_rate,
  } as any);
}

class ReviewController {

  async getAcceptedWorkersForReview(
    req: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const reviewerId = (req as any).user.id;
      const { jobId } = req.params;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.created_by !== reviewerId) return reply.code(403).send({ message: Messages.NOT_JOB_CREATOR });
      if (j.status !== JobStatus.COMPLETED) return reply.code(400).send({ message: Messages.JOB_NOT_COMPLETED });

      const responses = await JobResponseRepository.findByJob(jobId);
      const acceptedResponses = responses.filter((r: any) => r.status === 'ACCEPTED');

      const workers = await Promise.all(
        acceptedResponses.map(async (r: any) => {
          const worker = r.worker ? r.worker.toJSON() : {};
          const alreadyReviewed = !!(await ReviewRepository.findExisting(jobId, reviewerId, r.worker_id));
          return {
            worker_id: r.worker_id,
            name: worker.name,
            profile_photo: worker.profile_photo ?? null,
            rating: worker.rating ?? 0,
            total_jobs_completed: worker.total_jobs_completed ?? 0,
            already_reviewed: alreadyReviewed,
          };
        })
      );

      return reply.code(200).send({
        job: {
          id: j.id,
          title: j.title,
          status: j.status,
        },
        workers,
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async submitReview(
    req: FastifyRequest<{ Params: { jobId: string }; Body: { worker_id: string; rating: number; comment?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const reviewerId = (req as any).user.id;
      const { jobId } = req.params;
      const { worker_id, rating, comment } = req.body;

      if (reviewerId === worker_id) return reply.code(400).send({ message: Messages.CANNOT_REVIEW_SELF });

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.status !== JobStatus.COMPLETED) return reply.code(400).send({ message: Messages.JOB_NOT_COMPLETED });
      if (j.created_by !== reviewerId) return reply.code(403).send({ message: Messages.NOT_JOB_CREATOR });

      const workerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
      if (!workerIds.includes(worker_id)) {
        return reply.code(400).send({ message: 'Worker was not accepted for this job' });
      }

      const existing = await ReviewRepository.findExisting(jobId, reviewerId, worker_id);
      if (existing) return reply.code(409).send({ message: Messages.REVIEW_ALREADY_EXISTS });

      await ReviewRepository.create({ job_id: jobId, reviewer_id: reviewerId, worker_id, rating, comment });
      await updateWorkerStats(worker_id);

      return reply.code(201).send({ message: Messages.REVIEW_SUBMITTED });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async submitBulkReviews(
    req: FastifyRequest<{
      Params: { jobId: string };
      Body: Array<{ worker_id: string; rating: number; comment?: string }>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const reviewerId = (req as any).user.id;
      const { jobId } = req.params;
      const reviews = req.body;

      const job = await JobRepository.findById(jobId);
      if (!job) return reply.code(404).send({ message: Messages.JOB_NOT_FOUND });

      const j = job as any;
      if (j.status !== JobStatus.COMPLETED) return reply.code(400).send({ message: Messages.JOB_NOT_COMPLETED });
      if (j.created_by !== reviewerId) return reply.code(403).send({ message: Messages.NOT_JOB_CREATOR });

      const acceptedWorkerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);

      let submitted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const item of reviews) {
        const { worker_id, rating, comment } = item;

        if (worker_id === reviewerId) {
          errors.push(`Cannot review yourself (worker_id: ${worker_id})`);
          skipped++;
          continue;
        }

        if (!acceptedWorkerIds.includes(worker_id)) {
          errors.push(`Worker ${worker_id} was not accepted for this job`);
          skipped++;
          continue;
        }

        const existing = await ReviewRepository.findExisting(jobId, reviewerId, worker_id);
        if (existing) {
          skipped++;
          continue;
        }

        await ReviewRepository.create({ job_id: jobId, reviewer_id: reviewerId, worker_id, rating, comment });
        await updateWorkerStats(worker_id);
        submitted++;
      }

      return reply.code(201).send({
        message: Messages.REVIEW_SUBMITTED,
        submitted,
        skipped,
        ...(errors.length > 0 ? { errors } : {}),
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new ReviewController();
