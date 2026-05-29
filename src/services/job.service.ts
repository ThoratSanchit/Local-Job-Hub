import JobRepository from '../repositories/job.repository';
import UserRepository from '../repositories/user.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import RecentSearchRepository from '../repositories/recentSearch.repository';
import User from '../models/user.model';
import { JobStatus } from '../constants/job.constants';
import { NotificationType } from '../constants/notification.constants';
import { notify, notifyMany } from '../utility/notification.utility';
import CustomError from '../utility/customError.utility';
import { decodeJobCursor, encodeJobCursor } from '../utility/jobCursor.utility';
import Messages from '../language/en/message.language';
import {
  ICreateJobRequest,
  IFilterJobsQuery,
  IGetJobsQuery,
  IJobUpdateData,
  IUpdateJobData,
  IUpdateJobRequest,
} from '../interfaces/job.interface';
import { Op } from 'sequelize';
import { sequelize } from '../config/instance';

class JobService {
  async createJob(userId: string, data: ICreateJobRequest) {
    const {
      title,
      description,
      category,
      price,
      min_price,
      max_price,
      payment_type,
      work_duration,
      start_date,
      preferred_time,
      preferred_time_from,
      preferred_time_to,
      full_address,
      latitude,
      longitude,
      workers_required,
      urgent,
      expires_at,
      need_workers_immediately,
      requirements,
      city,
      area,
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
      min_price: min_price ?? null,
      max_price: max_price ?? null,
      payment_type: payment_type || null,
      work_duration: work_duration || null,
      start_date: start_date || null,
      preferred_time: preferred_time || null,
      preferred_time_from: preferred_time_from || null,
      preferred_time_to: preferred_time_to || null,
      full_address: full_address || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      city: city !== undefined ? city : creator.city,
      area: area !== undefined ? area : creator.area,
      created_by: userId,
      workers_required: workers_required || 1,
      urgent: !!urgent,
      expires_at: expires_at ? new Date(expires_at) : null,
      need_workers_immediately: !!need_workers_immediately,
      requirements: requirements?.length ? requirements : null,
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
        `${title} - Rs ${price}`,
        { job_id: job.id }
      );
    }

    return job;
  }

  async getJobs(userId: string, query: IGetJobsQuery) {
    if (query.search) {
      RecentSearchRepository.saveLatest(userId, query.search).catch(() => { });
    }

    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const rows = await JobRepository.findAll(userId, {
      limit: limit + 1,
      cursor: decodeJobCursor(query.cursor),
      search: query.search,
    });
    const hasNextPage = rows.length > limit;
    const jobs = hasNextPage ? rows.slice(0, limit) : rows;
    const lastJob = jobs[jobs.length - 1];

    return {
      jobs,
      pagination: {
        limit,
        nextCursor: hasNextPage && lastJob ? encodeJobCursor(lastJob) : null,
        hasNextPage,
      },
    };
  }

  async filterJobs(userId: string, query: IFilterJobsQuery) {
    const filters: any = {
      created_by: { [Op.ne]: userId },
      status: JobStatus.OPEN,
    };

    if (query.category) {
      filters.category = query.category;
    }

    if (query.city) filters.city = query.city;
    if (query.area) filters.area = query.area;

    if (query.minSalary !== undefined || query.maxSalary !== undefined) {
      filters.price = {};
      if (query.minSalary !== undefined) filters.price[Op.gte] = query.minSalary;
      if (query.maxSalary !== undefined) filters.price[Op.lte] = query.maxSalary;
    }

    if (query.workDuration) {
      filters.work_duration = query.workDuration;
    }

    if (query.isUrgent) {
      filters.urgent = true;
    }

    if (query.isNew) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      filters.createdAt = { [Op.gte]: threeDaysAgo };
    }

    if (query.distance !== undefined && query.latitude !== undefined && query.longitude !== undefined) {
      const haversine = `(
        6371 * acos(
          cos(radians(${query.latitude}))
          * cos(radians(latitude))
          * cos(radians(longitude) - radians(${query.longitude}))
          + sin(radians(${query.latitude})) * sin(radians(latitude))
        )
      )`;

      filters[Op.and] = filters[Op.and] || [];
      filters[Op.and].push(
        sequelize.where(sequelize.literal(haversine), {
          [Op.lte]: query.distance,
        })
      );
    }

    return JobRepository.searchJobs(userId, filters);
  }

  async getJobById(jobId: string) {
    const [job, application_count] = await Promise.all([
      JobRepository.findById(jobId),
      JobResponseRepository.countByJob(jobId),
    ]);

    if (!job) {
      throw new CustomError(404, Messages.JOB_NOT_FOUND);
    }

    return { ...job.toJSON(), application_count };
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

  async getRecentSearches(userId: string) {
    const searches = await RecentSearchRepository.findByUser(userId);

    return searches.map((search) => ({
      id: search.id,
      search_key: search.search_key,
      createdAt: search.createdAt,
    }));
  }

  async searchJobs(userId: string, data: any) {
    if (data.keyword) {
      await RecentSearchRepository.saveLatest(userId, data.keyword);
    }

    const filters: any = {
      created_by: { [Op.ne]: userId },
      status: JobStatus.OPEN,
    };

    if (data.category) {
      if (Array.isArray(data.category)) {
        filters.category = { [Op.in]: data.category };
      } else {
        filters.category = data.category;
      }
    }

    if (data.city) filters.city = data.city;
    if (data.area) filters.area = data.area;

    if (data.keyword) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${data.keyword}%` } },
        { description: { [Op.like]: `%${data.keyword}%` } },
      ];
    }

    if (data.minSalary !== undefined || data.maxSalary !== undefined) {
      filters.price = {};
      if (data.minSalary !== undefined) filters.price[Op.gte] = data.minSalary;
      if (data.maxSalary !== undefined) filters.price[Op.lte] = data.maxSalary;
    }

    if (data.workDuration) {
      if (Array.isArray(data.workDuration)) {
        filters.work_duration = { [Op.in]: data.workDuration };
      } else {
        filters.work_duration = data.workDuration;
      }
    }

    if (data.isUrgent) {
      filters.urgent = true;
    }

    if (data.isNew) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      filters.createdAt = { [Op.gte]: threeDaysAgo };
    }

    if (data.distance !== undefined && data.latitude !== undefined && data.longitude !== undefined) {
      const haversine = `(
        6371 * acos(
          cos(radians(${data.latitude}))
          * cos(radians(latitude))
          * cos(radians(longitude) - radians(${data.longitude}))
          + sin(radians(${data.latitude})) * sin(radians(latitude))
        )
      )`;

      filters[Op.and] = filters[Op.and] || [];
      filters[Op.and].push(
        sequelize.where(sequelize.literal(haversine), {
          [Op.lte]: data.distance
        })
      );
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
        body: 'Someone applied to your job',
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
