import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

export enum ResponseStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

class JobResponse extends Model {
  public id!: string;
  public job_id!: string;
  public worker_id!: string;
  public status!: ResponseStatus;
  public readonly createdAt!: Date;
}

JobResponse.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: { type: DataTypes.UUID, allowNull: false },
    worker_id: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(ResponseStatus)),
      defaultValue: ResponseStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: 'job_responses',
    timestamps: true,
    indexes: [{ unique: true, fields: ['job_id', 'worker_id'] }],
  }
);

export default JobResponse;
