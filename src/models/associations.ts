import User from './user.model';
import Job from './job.model';
import JobResponse from './jobResponse.model';
import Conversation from './conversation.model';
import Message from './message.model';
import Review from './review.model';
import Notification from './notification.model';
import RecentSearch from './recentSearch.model';

let associationsInitialized = false;

export const setupAssociations = () => {
  if (associationsInitialized) return;
  associationsInitialized = true;

  // Job ↔ User
  Job.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(Job, { foreignKey: 'created_by', as: 'jobs' });

  // JobResponse ↔ Job & User
  JobResponse.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  JobResponse.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });
  Job.hasMany(JobResponse, { foreignKey: 'job_id', as: 'responses' });

  // Conversation ↔ Job & Users
  Conversation.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  Conversation.belongsTo(User, { foreignKey: 'creator_id', as: 'conversationCreator' }); // renamed from 'creator' to avoid alias conflict with Job.belongsTo(User)
  Conversation.belongsTo(User, { foreignKey: 'worker_id', as: 'conversationWorker' }); // renamed from 'worker' to avoid alias conflict with JobResponse.belongsTo(User)
  Job.hasMany(Conversation, { foreignKey: 'job_id', as: 'conversations' });

  // Message ↔ Conversation & Sender
  Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
  Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

  // Review ↔ Job & User
  Review.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
  Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
  Review.belongsTo(User, { foreignKey: 'worker_id', as: 'reviewWorker' }); // renamed from 'worker' to avoid alias conflict

  // Notification ↔ User
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // RecentSearch to User
  RecentSearch.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(RecentSearch, { foreignKey: 'user_id', as: 'recentSearches' });
};
