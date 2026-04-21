import { FastifyRequest, FastifyReply } from 'fastify';
import NotificationRepository from '../repositories/notification.repository';
import Messages from '../language/en/message.language';

class NotificationController {
  async getNotifications(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const notifications = await NotificationRepository.findByUser(userId);
      return reply.code(200).send({ message: Messages.NOTIFICATIONS_FETCHED, data: notifications });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async markRead(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      await NotificationRepository.markRead(req.params.id, userId);
      return reply.code(200).send({ message: Messages.NOTIFICATION_MARKED_READ });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new NotificationController();
