import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

class Message extends Model {
  public id!: string;
  public job_id!: string;
  public sender_id!: string;
  public receiver_id!: string;
  public content!: string;
  public readonly createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: { type: DataTypes.UUID, allowNull: false },
    sender_id: { type: DataTypes.UUID, allowNull: false },
    receiver_id: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'messages', timestamps: true }
);

export default Message;
