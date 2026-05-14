import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

class Message extends Model {
  public id!: string;
  public conversation_id!: string;
  public sender_id!: string;
  public content!: string;
  public is_read!: boolean;
  public readonly createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true
  }
);

export default Message;
