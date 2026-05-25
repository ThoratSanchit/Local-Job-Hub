import Job from '../models/job.model';
import User from '../models/user.model';
import { ICreateJobData, IJobUpdateData, IUpdateJobData } from '../interfaces/job.interface';
import { Op, WhereOptions } from 'sequelize';
import { IJobCursor } from '../utility/jobCursor.utility';

class JobRepository {
  create(data: ICreateJobData) {
    return Job.create(data);
  }

  findById(id: string) {
    return Job.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: [
          'id', 'name', 'mobile_number', 'profile_photo', 'rating',
          'city', 'area', 'is_verified', 'total_jobs_completed',
          'completion_rate', 'availability_status', 'last_seen', 'gender'
        ]
      }],
    });
  }

  findAll(userId?: string, pagination?: { limit: number; cursor?: IJobCursor }) {
    const conditions: WhereOptions[] = [];

    if (userId) {
      conditions.push({ created_by: { [Op.ne]: userId } });
    }

    if (pagination?.cursor) {
      const { urgent, createdAt, id } = pagination.cursor;

      conditions.push({
        [Op.or]: [
          { urgent: { [Op.lt]: urgent } },
          {
            urgent,
            createdAt: { [Op.lt]: createdAt },
          },
          {
            urgent,
            createdAt,
            id: { [Op.lt]: id },
          },
        ],
      });
    }

    return Job.findAll({
      where: conditions.length ? { [Op.and]: conditions } : undefined,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating'] }],
      order: [
        ['urgent', 'DESC'],
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: pagination?.limit,
    });
  }

  update(id: string, data: IJobUpdateData) {
    return Job.update(data, { where: { id } });
  }

  updateJob(id: string, data: IUpdateJobData) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return Job.update(updateData, { where: { id } });
  }

  findByCreator(created_by: string) {
    return Job.findAll({
      where: { created_by },
      order: [['createdAt', 'DESC']],
    });
  }

  searchJobs(userId: string, filters: any) {
    return Job.findAll({
      where: filters,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating', 'city', 'area'] }],
      order: [
        ['urgent', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  }
}

export default new JobRepository();
