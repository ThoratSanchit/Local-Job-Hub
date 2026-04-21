import Notification from '../models/notification.model';

class NotificationRepository {
  findByUser(user_id: string) {
    return Notification.findAll({
      where: { user_id },
      order: [['createdAt', 'DESC']],
    });
  }

  markRead(id: string, user_id: string) {
    return Notification.update({ is_read: true }, { where: { id, user_id } });
  }
}

export default new NotificationRepository();
