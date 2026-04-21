import { Op } from 'sequelize';
import Job, { JobStatus } from '../models/job.model';

/**
 * Runs every minute to mark expired jobs.
 * Called once on server start.
 */
export const startExpiryScheduler = (): void => {
  const run = async () => {
    try {
      await Job.update(
        { status: JobStatus.EXPIRED },
        {
          where: {
            status: [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED],
            expires_at: { [Op.lt]: new Date() },
          },
        }
      );
    } catch (err) {
      console.error('Expiry scheduler error:', err);
    }
  };

  run(); // run immediately on start
  setInterval(run, 60 * 1000); // then every 60s
};
