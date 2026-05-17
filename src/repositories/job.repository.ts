import Job from '../models/job.model';
import User from '../models/user.model';
import { ICreateJobData, IJobUpdateData, IUpdateJobData } from '../interfaces/job.interface';

class JobRepository {
  create(data: ICreateJobData) {
    return Job.create(data);
  }

  findById(id: string) {
    return Job.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating', 'city', 'area'] }],
    });
  }

  findAll() {
    return Job.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating'] }],
      order: [
        ['urgent', 'DESC'],
        ['createdAt', 'DESC'],
      ],
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
