import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

class Review extends Model {
  public id!: string;
  public job_id!: string;
  public reviewer_id!: string;
  public worker_id!: string;
  public rating!: number;
  public comment!: string;
  public readonly createdAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: { type: DataTypes.UUID, allowNull: false },
    reviewer_id: { type: DataTypes.UUID, allowNull: false },
    worker_id: { type: DataTypes.UUID, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: true,
    indexes: [{ unique: true, fields: ['job_id', 'reviewer_id', 'worker_id'] }],
  }
);

export default Review;
