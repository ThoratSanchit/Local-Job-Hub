import JobRepository from '../repositories/job.repository';
import UserRepository from '../repositories/user.repository';
import User from '../models/user.model';
import { JobStatus } from '../constants/job.constants';
import { NotificationType } from '../constants/notification.constants';
import { notifyMany } from '../utility/notification.utility';
import { Op } from 'sequelize';

class JobService {
  async createJob(userId: string, data: any) {
    const { title, description, category, price, workers_required, urgent, expires_at } = data;

    const creator = await UserRepository.findById(userId);
    if (!creator) throw new Error('USER_NOT_FOUND');

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
      expires_at: expires_at ? new Date(expires_at) : null,
      status: JobStatus.OPEN,
    });

    // Notify nearby users
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
      await notifyMany(
        ids,
        NotificationType.JOB_CREATED,
        'New Job Near You',
        `${title} — ₹${price}`,
        { job_id: (job as any).id }
      );
    }

    return job;
  }
}

export default new JobService();
