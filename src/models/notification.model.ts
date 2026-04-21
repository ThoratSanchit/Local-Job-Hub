import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

export enum NotificationType {
  JOB_CREATED = 'JOB_CREATED',
  WORKER_ACCEPTED = 'WORKER_ACCEPTED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  JOB_CANCELLED = 'JOB_CANCELLED',
  NEW_RESPONSE = 'NEW_RESPONSE',
}

class Notification extends Model {
  public id!: string;
  public user_id!: string;
  public type!: NotificationType;
  public title!: string;
  public body!: string;
  public is_read!: boolean;
  public meta!: object;
  public readonly createdAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    meta: { type: DataTypes.JSON, defaultValue: {} },
  },
  { sequelize, tableName: 'notifications', timestamps: true }
);

export default Notification;
