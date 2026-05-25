import MessageRepository from '../repositories/message.repository';
import ConversationRepository from '../repositories/conversation.repository';
import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import { JobStatus } from '../constants/job.constants';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';
import { Op } from 'sequelize';
import Message from '../models/message.model';

const MESSAGEABLE_STATUSES: JobStatus[] = [
  JobStatus.PARTIALLY_ACCEPTED,
  JobStatus.FULL,
  JobStatus.COMPLETED,
];

class MessageService {
  async sendMessage(senderId: string, receiverId: string, jobId: string, content: string) {
    if (!content?.trim()) {
      throw new CustomError(400, 'Message content cannot be empty');
    }

    if (senderId === receiverId) {
      throw new CustomError(400, 'Cannot send a message to yourself');
    }

    const job = await JobRepository.findById(jobId);
    if (!job) throw new CustomError(404, Messages.JOB_NOT_FOUND);

    const j = job as any;

    if (j.status === JobStatus.CANCELLED || j.status === JobStatus.EXPIRED) {
      throw new CustomError(400, 'Cannot send messages on a cancelled or expired job');
    }

    if (!MESSAGEABLE_STATUSES.includes(j.status)) {
      throw new CustomError(400, 'Messaging is only available once a worker has been accepted');
    }

    const acceptedWorkerIds = await JobResponseRepository.findAcceptedWorkerIds(jobId);
    const participants = [j.created_by, ...acceptedWorkerIds];

    if (!participants.includes(senderId)) {
      throw new CustomError(403, Messages.NOT_PARTICIPANT);
    }
    if (!participants.includes(receiverId)) {
      throw new CustomError(403, 'Receiver is not a participant in this job');
    }

    // Find or create conversation
    const creatorId = j.created_by;
    const workerId = senderId === creatorId ? receiverId : senderId;

    let conversation = await ConversationRepository.findByParticipants(creatorId, workerId);

    if (!conversation) {
      conversation = await ConversationRepository.create({
        job_id: jobId,
        creator_id: creatorId,
        worker_id: workerId
      });
    } else {
      await ConversationRepository.updateConversationContext((conversation as any).id, jobId, creatorId, workerId);
    }

    const msg = await MessageRepository.create({
      conversation_id: (conversation as any).id,
      sender_id: senderId,
      content: content.trim()
    });

    return msg;
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await ConversationRepository.findById(conversationId);
    if (!conversation) throw new CustomError(404, 'Conversation not found');

    const conv = conversation as any;
    if (conv.creator_id !== userId && conv.worker_id !== userId) {
      throw new CustomError(403, 'Not a participant in this conversation');
    }

    // Mark messages as read
    await MessageRepository.markAsRead(conversationId, userId);

    return MessageRepository.findByConversation(conversationId);
  }

  async getInbox(userId: string) {
    const conversations = await ConversationRepository.findUserInbox(userId);

    const inbox = await Promise.all(conversations.map(async (conv: any) => {
      const latestMessage = await MessageRepository.findLatestByConversation(conv.id);

      const unreadCount = await Message.count({
        where: {
          conversation_id: conv.id,
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      });

      const convJson = conv.toJSON();
      const isCreator = convJson.creator_id === userId;
      const otherUser = isCreator ? convJson.conversationWorker : convJson.conversationCreator;
      delete convJson.conversationWorker;
      delete convJson.conversationCreator;

      return {
        ...convJson,
        participant: otherUser,
        latest_message: latestMessage,
        unread_count: unreadCount
      };
    }));

    return inbox;
  }
}

export default new MessageService();
