import UserRepository from '../repositories/user.repository';
import {
  IAuthResult,
  ILoginRequest,
  ISignupRequest
} from '../interfaces/auth.interface';
import { signToken } from '../utility/jwt.utility';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';
import { Gender } from '../enums/gender.enum';

const HARDCODED_OTP = process.env.HARDCODED_OTP || '82081';

class AuthService {
  async signup(data: ISignupRequest): Promise<IAuthResult> {
    const { name, mobile_number, gender, city, area } = data;

    if (!Object.values(Gender).includes(gender)) {
      throw new CustomError(400, Messages.INVALID_GENDER);
    }

    const existing = await UserRepository.findByMobile(mobile_number);
    if (existing) {
      throw new CustomError(409, Messages.MOBILE_ALREADY_EXISTS);
    }

    const user = await UserRepository.createUser({
      name,
      mobile_number,
      gender,
      city,
      area,
    });

    const token = signToken({ id: user.id, mobile_number });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile_number: user.mobile_number,
        gender: user.gender,
      },
    };
  }

  async login(data: ILoginRequest): Promise<IAuthResult> {
    const { mobile_number, otp } = data;

    const user = await UserRepository.findByMobile(mobile_number);
    if (!user || otp !== HARDCODED_OTP) {
      throw new CustomError(401, Messages.INVALID_OTP_OR_MOBILE);
    }

    const token = signToken({ id: user.id, mobile_number: user.mobile_number });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile_number: user.mobile_number,
        gender: user.gender,
      },
    };
  }
}

export default new AuthService();
