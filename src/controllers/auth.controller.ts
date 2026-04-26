import { FastifyRequest, FastifyReply } from 'fastify';
// import bcrypt from 'bcrypt';
import UserRepository from '../repositories/user.repository';
import { signToken } from '../utility/jwt.utility';
import Messages from '../language/en/message.language';

const HARDCODED_OTP = '82081';

class AuthController {
  async signup(req: FastifyRequest<{ Body: { name: string; mobile_number: string; city: string; area: string } }>, reply: FastifyReply) {
    try {
      const { name, mobile_number, city, area } = req.body;
      const existing = await UserRepository.findByMobile(mobile_number);
      if (existing) return reply.code(409).send({ message: Messages.MOBILE_ALREADY_EXISTS });

      const user = await UserRepository.createUser({ name, mobile_number, city, area });

      const token = signToken({ id: (user as any).id, mobile_number });
      return reply.code(201).send({ message: Messages.SIGNUP_SUCCESS, token });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async login(req: FastifyRequest<{ Body: { mobile_number: string; otp: string } }>, reply: FastifyReply) {
    try {
      const { mobile_number, otp } = req.body;
      const user = await UserRepository.findByMobile(mobile_number);
      if (!user) return reply.code(401).send({ message: Messages.INVALID_OTP_OR_MOBILE });

      if (otp !== HARDCODED_OTP) return reply.code(401).send({ message: Messages.INVALID_OTP_OR_MOBILE });

      const token = signToken({ id: user.id, mobile_number: user.mobile_number });
      return reply.code(200).send({ message: Messages.LOGIN_SUCCESS, token });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new AuthController();
