import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';
import { Gender } from '../enums/gender.enum';
import { AvailabilityStatus } from '../enums/availability.status.enum';

class User extends Model {
  public id!: string;
  public name!: string;
  public mobile_number!: string;
  public gender!: Gender;
  public age!: number;
  public city!: string | null;
  public area!: string | null;
  public pincode!: string | null;
  public profile_photo!: string | null;
  public about_me!: string | null;
  public skills!: string[] | null;
  public rating!: number;
  public total_jobs_completed!: number;
  public completion_rate!: number;
  public is_verified!: boolean;
  public availability_status!: AvailabilityStatus;
  public last_seen!: Date;
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
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    about_me: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true
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
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

export default User;
