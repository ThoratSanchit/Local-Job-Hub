import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import Job from '../models/job.model';
import { Op } from 'sequelize';

class ConversationRepository {
  create(data: Partial<Conversation>) {
    return Conversation.create(data as any);
  }

  findByParticipants(creator_id: string, worker_id: string) {
    return Conversation.findOne({
      where: {
        [Op.or]: [
          { creator_id, worker_id },
          { creator_id: worker_id, worker_id: creator_id }
        ]
      }
    });
  }

  findById(id: string) {
    return Conversation.findByPk(id, {
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'conversationCreator', attributes: ['id', 'name', 'last_seen', 'availability_status', 'profile_photo'] },
        { model: User, as: 'conversationWorker', attributes: ['id', 'name', 'last_seen', 'availability_status', 'profile_photo'] }
      ]
    });
  }

  findUserInbox(userId: string) {
    return Conversation.findAll({
      where: {
        [Op.or]: [{ creator_id: userId }, { worker_id: userId }]
      },
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'conversationCreator', attributes: ['id', 'name', 'last_seen', 'availability_status', 'profile_photo'] },
        { model: User, as: 'conversationWorker', attributes: ['id', 'name', 'last_seen', 'availability_status', 'profile_photo'] }
      ],
      order: [['last_message_at', 'DESC']]
    });
  }

  updateConversationContext(id: string, jobId: string, creatorId: string, workerId: string, timestamp: Date = new Date()) {
    return Conversation.update(
      {
        last_message_at: timestamp,
        job_id: jobId,
        creator_id: creatorId,
        worker_id: workerId
      },
      { where: { id } }
    );
  }
}

export default new ConversationRepository();
