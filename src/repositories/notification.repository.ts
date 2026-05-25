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

  findByIdAndUser(id: string, user_id: string) {
    return Notification.findOne({ where: { id, user_id } });
  }

  getUnreadCount(user_id: string) {
    return Notification.count({ where: { user_id, is_read: false } });
  }
}

export default new NotificationRepository();
