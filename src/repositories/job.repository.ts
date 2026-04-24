import Job, { JobStatus } from '../models/job.model';
import User from '../models/user.model';

class JobRepository {
  create(data: Partial<Job>) {
    return Job.create(data as any);
  }

  findById(id: string) {
    return Job.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating', 'city', 'area'] }],
    });
  }

  findByLocation(city: string, area: string) {
    return Job.findAll({
      where: { city, area, status: [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED] },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'rating'] }],
      // Urgent jobs shown first, then newest first
      order: [
        ['urgent', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  }

  update(id: string, data: Partial<Job>) {
    return Job.update(data as any, { where: { id } });
  }

  findByCreator(created_by: string) {
    return Job.findAll({
      where: { created_by },
      order: [['createdAt', 'DESC']],
    });
  }
}

export default new JobRepository();
