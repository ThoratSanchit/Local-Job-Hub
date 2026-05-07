import { NotificationType } from '../constants/notification.constants';

export interface INotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  meta: object;
}
