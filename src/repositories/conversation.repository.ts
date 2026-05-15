import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import Job from '../models/job.model';
import { Op } from 'sequelize';

class ConversationRepository {
  create(data: Partial<Conversation>) {
    return Conversation.create(data as any);
  }

  findByJobAndParticipants(job_id: string, creator_id: string, worker_id: string) {
    return Conversation.findOne({
      where: { job_id, creator_id, worker_id }
    });
  }

  findById(id: string) {
    return Conversation.findByPk(id, {
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'conversationCreator', attributes: ['id', 'name'] },
        { model: User, as: 'conversationWorker', attributes: ['id', 'name'] }
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
        { model: User, as: 'conversationCreator', attributes: ['id', 'name'] },
        { model: User, as: 'conversationWorker', attributes: ['id', 'name'] }
      ],
      order: [['last_message_at', 'DESC']]
    });
  }

  updateLastMessage(id: string, timestamp: Date = new Date()) {
    return Conversation.update({ last_message_at: timestamp }, { where: { id } });
  }
}

export default new ConversationRepository();
