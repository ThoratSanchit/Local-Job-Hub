import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

export enum AvailabilityStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

class User extends Model {
  public id!: string;
  public name!: string;
  // public email!: string;
  // public password!: string;
  public mobile_number!: string;
  public city!: string;
  public area!: string;
  public rating!: number;
  public total_jobs_completed!: number;
  public completion_rate!: number;
  public is_verified!: boolean;
  public availability_status!: AvailabilityStatus;
  public readonly createdAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    // email: { type: DataTypes.STRING, allowNull: false, unique: true },
    // password: { type: DataTypes.STRING, allowNull: false },
    mobile_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    city: { type: DataTypes.STRING, allowNull: false },
    area: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_jobs_completed: { type: DataTypes.INTEGER, defaultValue: 0 },
    completion_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    availability_status: {
      type: DataTypes.ENUM(...Object.values(AvailabilityStatus)),
      defaultValue: AvailabilityStatus.OFFLINE,
    },
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;
