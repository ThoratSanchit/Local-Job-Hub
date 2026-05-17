import JobResponseRepository from '../repositories/jobResponse.repository';
import JobRepository from '../repositories/job.repository';
import { JobStatus } from '../constants/job.constants';
import { ResponseStatus } from '../models/jobResponse.model';
import Messages from '../language/en/message.language';
import { notify } from '../utility/notification.utility';
import { NotificationType } from '../constants/notification.constants';
import CustomError from '../utility/customError.utility';

class JobResponseService {
  async getResponses(userId: string, jobId: string) {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new CustomError(404, Messages.JOB_NOT_FOUND);
    if ((job as any).created_by !== userId) throw new CustomError(403, Messages.JOB_UNAUTHORIZED);

    return JobResponseRepository.findByJob(jobId);
  }

  async acceptWorker(userId: string, jobId: string, responseId: string) {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new CustomError(404, Messages.JOB_NOT_FOUND);

    const j = job as any;
    if (j.created_by !== userId) throw new CustomError(403, Messages.JOB_UNAUTHORIZED);

    const openStatuses: JobStatus[] = [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED];
    if (!openStatuses.includes(j.status)) throw new CustomError(400, Messages.JOB_ALREADY_FULL);

    const response = await JobResponseRepository.findById(responseId);
    if (!response) throw new CustomError(404, Messages.RESPONSE_NOT_FOUND);
    if (response.status !== ResponseStatus.PENDING) throw new CustomError(400, Messages.RESPONSE_NOT_PENDING);

    // Re-check accepted count AFTER fetching response to guard against race conditions
    const acceptedCountBefore = await JobResponseRepository.countAccepted(jobId);
    if (acceptedCountBefore >= j.workers_required) {
      // Another concurrent request already filled the job — reject this one
      await JobResponseRepository.update(responseId, { status: ResponseStatus.REJECTED } as any);
      await JobRepository.update(jobId, { status: JobStatus.FULL } as any);
      await JobResponseRepository.rejectAllPending(jobId);
      throw new CustomError(400, Messages.JOB_ALREADY_FULL);
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

    return { message: Messages.WORKER_ACCEPTED, job_status: newStatus };
  }

  async rejectWorker(userId: string, jobId: string, responseId: string) {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new CustomError(404, Messages.JOB_NOT_FOUND);
    if ((job as any).created_by !== userId) throw new CustomError(403, Messages.JOB_UNAUTHORIZED);

    const response = await JobResponseRepository.findById(responseId);
    if (!response) throw new CustomError(404, Messages.RESPONSE_NOT_FOUND);
    if (response.status !== ResponseStatus.PENDING) throw new CustomError(400, Messages.RESPONSE_NOT_PENDING);

    await JobResponseRepository.update(responseId, { status: ResponseStatus.REJECTED } as any);
    return { message: Messages.WORKER_REJECTED };
  }
}

export default new JobResponseService();
