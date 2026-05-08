import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';
import { Gender } from '../enums/gender.enum';
import { AvailabilityStatus } from '../enums/availability.status.enum';

class User extends Model {
  public id!: string;
  public name!: string;
  public mobile_number!: string;
  public gender!: Gender;
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    gender: {
      type: DataTypes.ENUM(...Object.values(Gender)),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    total_jobs_completed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completion_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    availability_status: {
      type: DataTypes.ENUM(...Object.values(AvailabilityStatus)),
      defaultValue: AvailabilityStatus.OFFLINE,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

export default User;
