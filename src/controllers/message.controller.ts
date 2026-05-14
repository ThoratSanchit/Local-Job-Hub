import { FastifyRequest, FastifyReply } from 'fastify';
import MessageService from '../services/message.service';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';

class MessageController {
  async send(
    req: FastifyRequest<{ Body: { receiver_id: string; job_id: string; content: string } }>,
    reply: FastifyReply
  ) {
    try {
      const senderId = (req as any).user.id;
      const { receiver_id, job_id, content } = req.body;
      const msg = await MessageService.sendMessage(senderId, receiver_id, job_id, content);
      return reply.code(201).send({ message: Messages.MESSAGE_SENT, data: msg });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getMessages(req: FastifyRequest<{ Params: { conversationId: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const msgs = await MessageService.getMessages(userId, req.params.conversationId);
      return reply.code(200).send({ message: Messages.MESSAGES_FETCHED, data: msgs });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({ message: err.message });
      }
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getInbox(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const inbox = await MessageService.getInbox(userId);
      return reply.code(200).send({ message: 'Inbox fetched successfully', data: inbox });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new MessageController();
