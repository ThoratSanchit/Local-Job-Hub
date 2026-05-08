import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/instance";
import { JobStatus } from "../constants/job.constants";

class Job extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public price!: number;
  public city!: string;
  public area!: string;
  public created_by!: string;
  public workers_required!: number;
  public status!: JobStatus;
  public urgent!: boolean;
  public expires_at!: Date | null;
  public cancelled_by!: string | null;
  public cancellation_reason!: string | null;
  public readonly createdAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    workers_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JobStatus)),
      defaultValue: JobStatus.OPEN,
    },
    urgent: {
      type:
        DataTypes.BOOLEAN,
      defaultValue: false
    },
    expires_at: {
      type:
        DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    cancelled_by: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "jobs",
    timestamps: true
  },
);

export default Job;
