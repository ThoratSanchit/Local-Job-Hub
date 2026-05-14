import Message from '../models/message.model';
import User from '../models/user.model';
const { Op } = require('sequelize');

class MessageRepository {
  create(data: Partial<Message>) {
    return Message.create(data as any);
  }

  findByConversation(conversation_id: string) {
    return Message.findAll({
      where: { conversation_id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  markAsRead(conversation_id: string, exclude_sender_id: string) {
    return Message.update(
      { is_read: true },
      { 
        where: { 
          conversation_id, 
          sender_id: { [Op.ne]: exclude_sender_id },
          is_read: false
        } 
      }
    );
  }
}

export default new MessageRepository();
