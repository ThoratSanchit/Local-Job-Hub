import { FastifyRequest, FastifyReply } from 'fastify';
import Messages from '../language/en/message.language';
import { AvailabilityStatus } from '../enums/availability.status.enum';
import CustomError from '../utility/customError.utility';
import UserService from '../services/user.service';
import { IUpdateUser, IUserParams } from '../interfaces/user.interface';

class UserController {
  async getMe(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.getMe(userId);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.USER_FETCHED_SUCCESSFULLY,
        data: user,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getUser(req: FastifyRequest<{ Params: IUserParams }>, reply: FastifyReply) {
    try {
      const user = await UserService.getUser(req.params.id);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.USER_FETCHED_SUCCESSFULLY,
        data: user,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async updateProfile(
    req: FastifyRequest<{ Body: IUpdateUser }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.updateProfile(userId, req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.USER_UPDATED_SUCCESSFULLY,
        data: user,
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

  async toggleAvailability(
    req: FastifyRequest<{ Body: { availability_status: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (req as any).user.id;
      const { availability_status } = req.body;

      await UserService.toggleAvailability(userId, availability_status as AvailabilityStatus);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.AVAILABILITY_UPDATED,
        availability_status
      });
    } catch (err) {
      if (err instanceof CustomError) {
        return reply.code(err.statusCode).send({
          statusCode: err.statusCode,
          message: err.message
        });
      }

      req.log.error(err);
      return reply.code(500).send({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR
      });
    }
  }

}

export default new UserController();
