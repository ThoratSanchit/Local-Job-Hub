import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/instance';
import { ICreateRecentSearchData, IRecentSearch } from '../interfaces/recentSearch.interface';

class RecentSearch extends Model<IRecentSearch, ICreateRecentSearchData> implements IRecentSearch {
  public id!: string;
  public user_id!: string;
  public search_data!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecentSearch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    search_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'recent_searches',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id'],
      },
    ],
  }
);

export default RecentSearch;
