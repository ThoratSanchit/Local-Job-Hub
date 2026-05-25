import { Op } from 'sequelize';
import Job from '../models/job.model';
import { JobStatus } from '../constants/job.constants';
import JobResponse from '../models/jobResponse.model';
import User from '../models/user.model';
import { AvailabilityStatus } from '../enums/availability.status.enum';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Runs every minute to mark expired jobs.
 * Called once on server start.
 *
 * Rules:
 * - Jobs WITH expires_at → expire normally when that timestamp passes.
 * - Jobs WITHOUT expires_at and ZERO responses → auto-deleted after 100 days.
 * - Jobs WITHOUT expires_at but WITH responses → left active (creator must complete/cancel).
 */
export const startExpiryScheduler = (): void => {
  // --- Task 1: Expire jobs that have a set expires_at ---
  const runExpiry = async () => {
    try {
      const candidates = await Job.findAll({
        where: {
          status: [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED],
          expires_at: { [Op.lt]: new Date(), [Op.ne]: null },
        },
        attributes: ['id'],
      });

      for (const job of candidates) {
        await Job.update({ status: JobStatus.EXPIRED }, { where: { id: job.id } });
      }
    } catch (err) {
      console.error('Expiry scheduler error:', err);
    }
  };

  // --- Task 2: Delete stale zero-response jobs without expires_at (after 100 days) ---
  const runCleanup = async () => {
    try {
      const cutoff = new Date(Date.now() - 100 * DAY_MS);

      const staleJobs = await Job.findAll({
        where: {
          status: [JobStatus.OPEN, JobStatus.PARTIALLY_ACCEPTED],
          expires_at: { [Op.is]: null },
          createdAt: { [Op.lt]: cutoff },
        },
        attributes: ['id'],
      });

      for (const job of staleJobs) {
        const responseCount = await JobResponse.count({ where: { job_id: job.id } });
        if (responseCount === 0) {
          await Job.destroy({ where: { id: job.id } });
        }
      }
    } catch (err) {
      console.error('Stale-job cleanup error:', err);
    }
  };

  // --- Task 3: Mark inactive users as OFFLINE after 5 minutes of inactivity ---
  const runUserOfflineCheck = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      await User.update(
        { availability_status: AvailabilityStatus.OFFLINE },
        {
          where: {
            availability_status: AvailabilityStatus.ONLINE,
            last_seen: { [Op.lt]: fiveMinutesAgo }
          }
        }
      );
    } catch (err) {
      console.error('User offline check scheduler error:', err);
    }
  };

  // Kick off tasks immediately
  runExpiry();
  runCleanup();
  runUserOfflineCheck();

  // Repeat expiry check every minute
  setInterval(runExpiry, 60 * 1000);

  // Repeat cleanup once a day (100-day window doesn't need minute precision)
  setInterval(runCleanup, DAY_MS);

  // Repeat offline user check every minute
  setInterval(runUserOfflineCheck, 60 * 1000);
};
