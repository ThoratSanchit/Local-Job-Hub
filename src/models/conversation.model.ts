import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

class Conversation extends Model {
  public id!: string;
  public job_id!: string;
  public creator_id!: string;
  public worker_id!: string;
  public last_message_at!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    creator_id: {//Jo job post karto
      type: DataTypes.UUID,
      allowNull: false
    },
    worker_id: {//Jo job la apply karto
      type: DataTypes.UUID,
      allowNull: false
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true
  }
);

export default Conversation;
