import UserRepository from '../repositories/user.repository';
import {
  IAuthResult,
  IOtpRequest,
  ISignupRequest,
  IVerifyOtpRequest,
  IVerifyOtpResult
} from '../interfaces/auth.interface';
import { signToken } from '../utility/jwt.utility';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';
import { Gender } from '../enums/gender.enum';

const HARDCODED_OTP = process.env.HARDCODED_OTP || '82081';

const pendingOtpMobiles = new Set<string>();
const verifiedSignupMobiles = new Set<string>();

const normalizeMobileNumber = (mobile_number: string) => mobile_number.trim();

const validateMobileNumber = (mobile_number: string) => {
  if (!/^[6-9]\d{9}$/.test(mobile_number)) {
    throw new CustomError(400, Messages.INVALID_MOBILE_NUMBER);
  }
};

class AuthService {
  private buildAuthResult(user: any): IAuthResult {
    const token = signToken({ id: user.id, mobile_number: user.mobile_number });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile_number: user.mobile_number,
        gender: user.gender,
        profile_photo: user.profile_photo,
      },
    };
  }

  async sendOtp(data: IOtpRequest): Promise<{ otp: string }> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    validateMobileNumber(mobile_number);

    pendingOtpMobiles.add(mobile_number);

    return { otp: HARDCODED_OTP };
  }

  async verifyOtp(data: IVerifyOtpRequest): Promise<IVerifyOtpResult> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    const { otp } = data;
    validateMobileNumber(mobile_number);

    if (!pendingOtpMobiles.has(mobile_number) || otp !== HARDCODED_OTP) {
      throw new CustomError(401, Messages.INVALID_OTP);
    }

    pendingOtpMobiles.delete(mobile_number);

    const user = await UserRepository.findByMobile(mobile_number);
    if (user) {
      const authResult = this.buildAuthResult(user);

      return {
        is_registered: true,
        signup_required: false,
        ...authResult,
      };
    }

    verifiedSignupMobiles.add(mobile_number);

    return {
      is_registered: false,
      signup_required: true,
    };
  }

  async signup(data: ISignupRequest): Promise<IAuthResult> {
    const { name, gender, city, area, profile_photo } = data;
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    validateMobileNumber(mobile_number);

    if (!verifiedSignupMobiles.has(mobile_number)) {
      throw new CustomError(401, Messages.SIGNUP_OTP_REQUIRED);
    }

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
      profile_photo: profile_photo || null,
      is_verified: true,
    });

    verifiedSignupMobiles.delete(mobile_number);

    return this.buildAuthResult(user);
  }
}

export default new AuthService();
