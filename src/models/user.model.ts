import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';

class User extends Model {
  public id!: string;
  public first_name!: string;
  public email!: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true, // Typically includes createdAt and updatedAt
  }
);

export default User;
