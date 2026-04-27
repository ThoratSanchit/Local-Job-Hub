import Notification from '../models/notification.model';
import { NotificationType } from '../constants/notification.constants';

interface NotifyPayload {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  meta?: object;
}

export const notify = async (payload: NotifyPayload): Promise<void> => {
  await Notification.create({
    user_id: payload.user_id,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    meta: payload.meta || {},
  });
};

export const notifyMany = async (user_ids: string[], type: NotificationType, title: string, body: string, meta?: object): Promise<void> => {
  const records = user_ids.map((uid) => ({
    user_id: uid,
    type,
    title,
    body,
    meta: meta || {},
  }));
  await Notification.bulkCreate(records as any);
};
