import { FastifyRequest, FastifyReply } from 'fastify';
import AuthService from '../services/auth.service';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import { isFileSizeLimitError, uploadProfilePhoto } from '../utility/upload.image';
import {
  IOtpRequest,
  ISignupRequest,
  IVerifyOtpRequest,
} from '../interfaces/auth.interface';
class AuthController {
  async sendOtp(req: FastifyRequest<{ Body: IOtpRequest }>, reply: FastifyReply) {
    try {
      const { otp } = await AuthService.sendOtp(req.body);

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

  async verifyOtp(req: FastifyRequest<{ Body: IVerifyOtpRequest }>, reply: FastifyReply) {
    try {
      const result = await AuthService.verifyOtp(req.body);

      return reply.code(200).send({
        statusCode: 200,
        message: result.is_registered ? Messages.LOGIN_SUCCESS : Messages.OTP_VERIFIED,
        ...result,
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
