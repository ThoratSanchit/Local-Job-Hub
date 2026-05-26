import { FastifyRequest, FastifyReply } from 'fastify';
import RecentSearchRepository from '../repositories/recentSearch.repository';
import Messages from '../language/en/message.language';

class RecentSearchController {
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const searches = await RecentSearchRepository.findByUser(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.RECENT_SEARCHES_FETCHED,
        data: searches.map((s) => ({
          id: s.id,
          search_key: s.search_key,
          updatedAt: s.updatedAt,
        })),
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ statusCode: 500, message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async deleteOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const deleted = await RecentSearchRepository.deleteOne(req.params.id, userId);

      if (!deleted) {
        return reply.code(404).send({ statusCode: 404, message: 'Recent search not found' });
      }

      return reply.code(200).send({ statusCode: 200, message: 'Recent search deleted' });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ statusCode: 500, message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async deleteAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      await RecentSearchRepository.deleteAll(userId);

      return reply.code(200).send({ statusCode: 200, message: 'All recent searches cleared' });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ statusCode: 500, message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new RecentSearchController();
