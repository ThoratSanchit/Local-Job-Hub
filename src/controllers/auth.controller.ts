import { FastifyRequest, FastifyReply } from 'fastify';
import AuthService from '../services/auth.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import {
  ILoginRequest,
  ISignupRequest,
} from '../interfaces/auth.interface';

class AuthController {
  async signup(req: FastifyRequest<{ Body: ISignupRequest }>, reply: FastifyReply) {
    try {
      const { token, user } = await AuthService.signup(req.body);

      return reply.code(201).send({
        statusCode: 201,
        message: Messages.SIGNUP_SUCCESS,
        token,
        user,
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

  async login(req: FastifyRequest<{ Body: ILoginRequest }>, reply: FastifyReply) {
    try {
      const { token, user } = await AuthService.login(req.body);

      return reply.code(200).send({
        statusCode: 200, message:
          Messages.LOGIN_SUCCESS,
        token,
        user,
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

export default new AuthController();
