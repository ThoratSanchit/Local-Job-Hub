import JobRepository from '../repositories/job.repository';
import UserRepository from '../repositories/user.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import User from '../models/user.model';
import { JobStatus } from '../constants/job.constants';
import { NotificationType } from '../constants/notification.constants';
import { notify, notifyMany } from '../utility/notification.utility';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';
import { ICreateJobRequest, IJobUpdateData, IUpdateJobData, IUpdateJobRequest } from '../interfaces/job.interface';
import { Op } from 'sequelize';

class JobService {
  async createJob(userId: string, data: ICreateJobRequest) {
    const {
      title,
      description,
      category,
      price,
      workers_required,
      urgent,
      expires_at,
      city,
      area
    } = data;

    const creator = await UserRepository.findById(userId);
    if (!creator) {
      throw new CustomError(404, Messages.USER_NOT_FOUND);
    }

    if (expires_at && new Date(expires_at) <= new Date()) {
      throw new CustomError(400, Messages.EXPIRES_AT_MUST_BE_FUTURE);
    }

    const job = await JobRepository.create({
      title,
      description,
      category,
      price,
      city: city || creator.city,
      area: area || creator.area,
      created_by: userId,
      workers_required: workers_required || 1,
      urgent: !!urgent,
      expires_at: expires_at ? new Date(expires_at) : null,
      status: JobStatus.OPEN,
    });

    const nearbyUsers = await User.findAll({
      where: {
        city: creator.city,
        area: creator.area,
        id: { [Op.ne]: userId },
      },
      attributes: ['id'],
    });

    const ids = nearbyUsers.map((u) => u.id);
    if (ids.length) {
      await notifyMany(
        ids,
        NotificationType.JOB_CREATED,
        'New Job Near You',
        `${title} — ₹${price}`,
        { job_id: job.id }
      );
    }

    return job;
  }

  async getJobs(userId: string) {
    return JobRepository.findAll();
  }

  async getJobById(jobId: string) {
    const job = await JobRepository.findById(jobId);

    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    return job;
  }

  async updateJob(userId: string, jobId: string, data: IUpdateJobRequest) {
    const job = await JobRepository.findById(jobId);

    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    if (job.created_by !== userId) {
      throw new CustomError(403, Messages.JOB_UNAUTHORIZED);
    }

    const { expires_at, ...jobFields } = data;
    const updateData: IUpdateJobData = { ...jobFields };

    if (expires_at !== undefined) {
      if (expires_at !== null && new Date(expires_at) <= new Date()) {
        throw new CustomError(400, Messages.EXPIRES_AT_MUST_BE_FUTURE);
      }

      updateData.expires_at = expires_at ? new Date(expires_at) : null;
    }

    await JobRepository.updateJob(jobId, updateData);

    return this.getJobById(jobId);
  }

  async cancelJob(userId: string, jobId: string, reason?: string) {
    const job = await JobRepository.findById(jobId);

    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    if (job.created_by !== userId) {
      throw new CustomError(403, Messages.JOB_UNAUTHORIZED);
    }

    const terminal: JobStatus[] = [JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.EXPIRED];
    if (terminal.includes(job.status)) {
      throw new CustomError(400, Messages.JOB_CANCEL_INVALID_STATE);
    }

    const updateData: IJobUpdateData = {
      status: JobStatus.CANCELLED,
      cancelled_by: userId,
      cancellation_reason: reason || null,
    };

    await JobRepository.update(jobId, updateData);

    const workerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
    if (workerIds.length) {
      await notifyMany(
        workerIds,
        NotificationType.JOB_CANCELLED,
        'Job Cancelled',
        `The job "${job.title}" has been cancelled.`,
        { job_id: jobId }
      );
    }
  }

  async completeJob(userId: string, jobId: string) {
    const job = await JobRepository.findById(jobId);

    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    if (job.created_by !== userId) {
      throw new CustomError(403, Messages.JOB_UNAUTHORIZED);
    }

    if (!([JobStatus.FULL, JobStatus.PARTIALLY_ACCEPTED] as JobStatus[]).includes(job.status)) {
      throw new CustomError(400, Messages.JOB_COMPLETE_INVALID_STATE);
    }

    await JobRepository.update(jobId, { status: JobStatus.COMPLETED });

    const workerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
    const allIds = [...new Set([...workerIds, userId])];
    await notifyMany(
      allIds,
      NotificationType.JOB_COMPLETED,
      'Job Completed',
      `The job "${job.title}" has been marked as completed.`,
      { job_id: jobId }
    );
  }

  getMyPostedJobs(userId: string) {
    return JobRepository.findByCreator(userId);
  }

  getMyAcceptedJobs(userId: string) {
    return JobResponseRepository.findByWorkerAccepted(userId);
  }

  getMyApplications(userId: string) {
    return JobResponseRepository.findByWorkerAll(userId);
  }

  async searchJobs(userId: string, data: any) {
    const filters: any = {
      created_by: { [Op.ne]: userId },
      status: JobStatus.OPEN,
    };

    if (data.category) filters.category = data.category;
    if (data.city) filters.city = data.city;
    if (data.area) filters.area = data.area;
    
    if (data.keyword) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${data.keyword}%` } },
        { description: { [Op.like]: `%${data.keyword}%` } },
      ];
    }

    return JobRepository.searchJobs(userId, filters);
  }

  async applyJob(workerId: string, jobId: string) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    const j = job as any;
    if (j.created_by === workerId) {
      throw new CustomError(400, Messages.CANNOT_RESPOND_OWN_JOB);
    }
    if (j.expires_at && new Date(j.expires_at) < new Date()) {
      throw new CustomError(400, Messages.JOB_EXPIRED);
    }

    const openStatuses: JobStatus[] = [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED];
    if (!openStatuses.includes(j.status)) {
      throw new CustomError(400, Messages.JOB_NOT_OPEN);
    }

    const existing = await JobResponseRepository.findByJobAndWorker(jobId, workerId);
    if (existing) {
      throw new CustomError(409, Messages.RESPONSE_ALREADY_EXISTS);
    }

    try {
      const response = await JobResponseRepository.create({ job_id: jobId, worker_id: workerId });

      await notify({
        user_id: j.created_by,
        type: NotificationType.NEW_RESPONSE,
        title: 'New Worker Response',
        body: `Someone applied to your job`,
        meta: { job_id: jobId },
      });

      return response;
    } catch (err: any) {
      if (err?.name === 'SequelizeUniqueConstraintError') {
        throw new CustomError(409, Messages.RESPONSE_ALREADY_EXISTS);
      }
      throw err;
    }
  }
}

export default new JobService();
