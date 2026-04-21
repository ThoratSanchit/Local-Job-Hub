import { FastifyRequest, FastifyReply } from 'fastify';
import UserRepository from '../repositories/user.repository';
import Messages from '../language/en/message.language';

class UserController {
  async getUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = req.params;
      const user = await UserRepository.findById(id);

      if (!user) {
        return reply.code(404).send({ message: Messages.USER_NOT_FOUND });
      }

      return reply.code(200).send({
        message: Messages.USER_FETCHED_SUCCESSFULLY,
        data: user,
      });
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ message: Messages.ERROR_FETCHING_USER });
    }
  }

  async createUser(req: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
      try {
          const user = await UserRepository.createUser(req.body);
          return reply.code(201).send({
              message: Messages.USER_CREATED_SUCCESSFULLY,
              data: user
          });
      } catch (error) {
          req.log.error(error);
          return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
      }
  }
}

export default new UserController();
