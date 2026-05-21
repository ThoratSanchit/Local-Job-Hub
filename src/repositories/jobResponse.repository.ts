import { ResponseStatus } from '../enums/response.status.enum';
import JobResponse from '../models/jobResponse.model';
import User from '../models/user.model';

class JobResponseRepository {
  create(data: Partial<JobResponse>) {
    return JobResponse.create(data as any);
  }

  findByJobAndWorker(job_id: string, worker_id: string) {
    return JobResponse.findOne({ where: { job_id, worker_id } });
  }

  findById(id: string) {
    return JobResponse.findByPk(id);
  }

  findByJob(job_id: string) {
    return JobResponse.findAll({
      where: { job_id },
      include: [{ model: User, as: 'worker'}],
    });
  }

  countAccepted(job_id: string) {
    return JobResponse.count({ where: { job_id, status: ResponseStatus.ACCEPTED } });
  }

  rejectAllPending(job_id: string) {
    return JobResponse.update(
      { status: ResponseStatus.REJECTED },
      { where: { job_id, status: ResponseStatus.PENDING } }
    );
  }

  update(id: string, data: Partial<JobResponse>) {
    return JobResponse.update(data as any, { where: { id } });
  }

  findAcceptedWorkerIds(job_id: string): Promise<string[]> {
    return JobResponse.findAll({
      where: { job_id, status: ResponseStatus.ACCEPTED },
      attributes: ['worker_id'],
    }).then((rows) => rows.map((r) => r.worker_id));
  }

  async countCompletedJobsForWorker(worker_id: string): Promise<number> {
    const { default: Job } = await import('../models/job.model');
    const { JobStatus } = await import('../constants/job.constants');
    return JobResponse.count({
      where: { worker_id, status: ResponseStatus.ACCEPTED },
      include: [{ model: Job, as: 'job', where: { status: JobStatus.COMPLETED }, required: true }],
    });
  }

  findByWorkerAccepted(worker_id: string) {
    return JobResponse.findAll({
      where: { worker_id, status: ResponseStatus.ACCEPTED },
      include: [{ model: require('../models/job.model').default, as: 'job' }],
      order: [['createdAt', 'DESC']],
    });
  }

  findByWorkerAll(worker_id: string) {
    return JobResponse.findAll({
      where: { worker_id },
      include: [{ model: require('../models/job.model').default, as: 'job' }],
      order: [['createdAt', 'DESC']],
    });
  }
}

export default new JobResponseRepository();
