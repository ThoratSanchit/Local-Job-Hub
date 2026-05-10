import { FastifyRequest, FastifyReply } from 'fastify';
import AuthService from '../services/auth.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import { isFileSizeLimitError, uploadProfilePhoto } from '../utility/upload.image';
import {
  ILoginOtpRequest,
  ILoginRequest,
  ISignupOtpRequest,
  ISignupRequest,
  IVerifySignupOtpRequest,
} from '../interfaces/auth.interface';
class AuthController {
  async sendSignupOtp(req: FastifyRequest<{ Body: ISignupOtpRequest }>, reply: FastifyReply) {
    try {
      const { otp } = await AuthService.sendSignupOtp(req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.OTP_SENT,
        otp,
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

  async verifySignupOtp(req: FastifyRequest<{ Body: IVerifySignupOtpRequest }>, reply: FastifyReply) {
    try {
      await AuthService.verifySignupOtp(req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.OTP_VERIFIED,
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

  async sendLoginOtp(req: FastifyRequest<{ Body: ILoginOtpRequest }>, reply: FastifyReply) {
    try {
      const { otp } = await AuthService.sendLoginOtp(req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.LOGIN_OTP_SENT,
        otp,
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

  async uploadProfilePhoto(req: FastifyRequest, reply: FastifyReply) {
    const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

    try {
      const file = await (req as any).file({
        limits: {
          fileSize: MAX_PROFILE_PHOTO_SIZE,
        },
      });

      if (!file) {
        throw new CustomError(400, Messages.PROFILE_PHOTO_REQUIRED);
      }

      const buffer = await file.toBuffer();
      if (file.file.truncated || buffer.length > MAX_PROFILE_PHOTO_SIZE) {
        throw new CustomError(400, Messages.PROFILE_PHOTO_TOO_LARGE);
      }

      const profile_photo = await uploadProfilePhoto(buffer);

      return reply.code(200).send({
        statusCode: 200,
        message: Messages.PROFILE_PHOTO_UPLOADED,
        profile_photo,
      });
    } catch (err) {
      if (isFileSizeLimitError(err)) {
        return reply.code(400).send({
          statusCode: 400,
          message: Messages.PROFILE_PHOTO_TOO_LARGE
        });
      }

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
