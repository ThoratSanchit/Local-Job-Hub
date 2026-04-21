import Message from '../models/message.model';
import User from '../models/user.model';

class MessageRepository {
  create(data: Partial<Message>) {
    return Message.create(data as any);
  }

  findByJob(job_id: string) {
    return Message.findAll({
      where: { job_id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'ASC']],
    });
  }
}

export default new MessageRepository();
