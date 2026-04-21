import User from './user.model';
import Job from './job.model';
import JobResponse from './jobResponse.model';
import Message from './message.model';
import Review from './review.model';
import Notification from './notification.model';

export const setupAssociations = () => {
  // Job ↔ User
  Job.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(Job, { foreignKey: 'created_by', as: 'jobs' });

  // JobResponse ↔ Job & User
  JobResponse.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  JobResponse.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });
  Job.hasMany(JobResponse, { foreignKey: 'job_id', as: 'responses' });

  // Message ↔ Job & User
  Message.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

  // Review ↔ Job & User
  Review.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
  Review.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

  // Notification ↔ User
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};
