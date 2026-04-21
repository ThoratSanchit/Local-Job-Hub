import Review from '../models/review.model';
import { fn, col } from 'sequelize';

class ReviewRepository {
  create(data: Partial<Review>) {
    return Review.create(data as any);
  }

  // Correct uniqueness: one review per (job, reviewer, worker) triple
  findExisting(job_id: string, reviewer_id: string, worker_id: string) {
    return Review.findOne({ where: { job_id, reviewer_id, worker_id } });
  }

  async getWorkerStats(worker_id: string): Promise<{ avg: number; count: number }> {
    const result = await Review.findOne({
      where: { worker_id },
      attributes: [
        [fn('AVG', col('rating')), 'avg'],
        [fn('COUNT', col('id')), 'count'],
      ],
      raw: true,
    }) as any;
    return {
      avg: Math.round((parseFloat(result?.avg) || 0) * 10) / 10, // round to 1 decimal
      count: parseInt(result?.count) || 0,
    };
  }
}

export default new ReviewRepository();
