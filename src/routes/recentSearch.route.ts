import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import RecentSearchController from '../controllers/recentSearch.controller';
import { verifyToken } from '../middlewares/verifyToken';

const recentSearchRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', verifyToken);

  fastify.get('/', RecentSearchController.getAll);
  fastify.delete('/:id', RecentSearchController.deleteOne);
  fastify.delete('/', RecentSearchController.deleteAll);
};

export default recentSearchRoutes;
