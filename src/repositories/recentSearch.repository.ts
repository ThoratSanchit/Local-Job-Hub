import { Op } from 'sequelize';
import RecentSearch from '../models/recentSearch.model';

const MAX_RECENT_SEARCHES = 5;

class RecentSearchRepository {
  async saveLatest(userId: string, searchData: object) {
    await RecentSearch.create({
      user_id: userId,
      search_data: searchData,
    });

    await this.removeOldSearches(userId);
  }

  findByUser(userId: string) {
    return RecentSearch.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit: MAX_RECENT_SEARCHES,
    });
  }

  private async removeOldSearches(userId: string) {
    const oldSearches = await RecentSearch.findAll({
      where: { user_id: userId },
      attributes: ['id'],
      order: [['createdAt', 'DESC']],
      offset: MAX_RECENT_SEARCHES,
    });

    const oldSearchIds = oldSearches.map((search) => search.id);
    if (!oldSearchIds.length) return;

    await RecentSearch.destroy({
      where: {
        id: { [Op.in]: oldSearchIds },
      },
    });
  }
}

export default new RecentSearchRepository();
