import { Op } from 'sequelize';
import RecentSearch from '../models/recentSearch.model';

const MAX_RECENT_SEARCHES = 5;

class RecentSearchRepository {
  async saveLatest(userId: string, keyword: string): Promise<void> {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return;

    const existing = await RecentSearch.findOne({
      where: { user_id: userId, search_key: normalized },
    });

    if (existing) {
      await RecentSearch.update(
        { search_key: normalized },
        { where: { id: existing.id } }
      );
    } else {
      await RecentSearch.create({
        user_id: userId,
        search_key: normalized,
      });

      await this.removeOldSearches(userId);
    }
  }

  findByUser(userId: string) {
    return RecentSearch.findAll({
      where: { user_id: userId },
      order: [['updatedAt', 'DESC']],
      limit: MAX_RECENT_SEARCHES,
    });
  }

  deleteOne(id: string, userId: string) {
    return RecentSearch.destroy({ where: { id, user_id: userId } });
  }

  deleteAll(userId: string) {
    return RecentSearch.destroy({ where: { user_id: userId } });
  }

  private async removeOldSearches(userId: string) {
    const oldSearches = await RecentSearch.findAll({
      where: { user_id: userId },
      attributes: ['id'],
      order: [['updatedAt', 'DESC']],
      offset: MAX_RECENT_SEARCHES,
    });

    const oldIds = oldSearches.map((s) => s.id);
    if (!oldIds.length) return;

    await RecentSearch.destroy({
      where: { id: { [Op.in]: oldIds } },
    });
  }
}

export default new RecentSearchRepository();
