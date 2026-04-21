import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/user.repository';
import { signToken } from '../utility/jwt.utility';
import Messages from '../language/en/message.language';

class AuthController {
  async signup(req: FastifyRequest<{ Body: { name: string; email: string; password: string; city: string; area: string } }>, reply: FastifyReply) {
    try {
      const { name, email, password, city, area } = req.body;
      const existing = await UserRepository.findByEmail(email);
      if (existing) return reply.code(409).send({ message: Messages.EMAIL_ALREADY_EXISTS });

      const hashed = await bcrypt.hash(password, 10);
      const user = await UserRepository.createUser({ name, email, password: hashed, city, area });

      const token = signToken({ id: (user as any).id, email });
      return reply.code(201).send({ message: Messages.SIGNUP_SUCCESS, token });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async login(req: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
    try {
      const { email, password } = req.body;
      const user = await UserRepository.findByEmail(email);
      if (!user) return reply.code(401).send({ message: Messages.INVALID_CREDENTIALS });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return reply.code(401).send({ message: Messages.INVALID_CREDENTIALS });

      const token = signToken({ id: user.id, email: user.email });
      return reply.code(200).send({ message: Messages.LOGIN_SUCCESS, token });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }
}

export default new AuthController();
