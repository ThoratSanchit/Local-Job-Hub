import UserRepository from '../repositories/user.repository';
import {
  IAuthResult,
  ILoginOtpRequest,
  ILoginRequest,
  ISignupOtpRequest,
  ISignupRequest,
  IVerifySignupOtpRequest
} from '../interfaces/auth.interface';
import { signToken } from '../utility/jwt.utility';
import CustomError from '../utility/customError.utility';
import Messages from '../language/en/message.language';
import { Gender } from '../enums/gender.enum';

const HARDCODED_OTP = process.env.HARDCODED_OTP || '82081';

const pendingSignupMobiles = new Set<string>();
const verifiedSignupMobiles = new Set<string>();
const pendingLoginMobiles = new Set<string>();

const normalizeMobileNumber = (mobile_number: string) => mobile_number.trim();

const validateMobileNumber = (mobile_number: string) => {
  if (!/^[6-9]\d{9}$/.test(mobile_number)) {
    throw new CustomError(400, Messages.INVALID_MOBILE_NUMBER);
  }
};

class AuthService {
  async sendSignupOtp(data: ISignupOtpRequest): Promise<{ otp: string }> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    validateMobileNumber(mobile_number);

    const existing = await UserRepository.findByMobile(mobile_number);
    if (existing) {
      throw new CustomError(409, Messages.MOBILE_ALREADY_EXISTS);
    }

    pendingSignupMobiles.add(mobile_number);

    return { otp: HARDCODED_OTP };
  }

  async verifySignupOtp(data: IVerifySignupOtpRequest): Promise<void> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    const { otp } = data;
    validateMobileNumber(mobile_number);

    const existing = await UserRepository.findByMobile(mobile_number);
    if (existing) {
      throw new CustomError(409, Messages.MOBILE_ALREADY_EXISTS);
    }

    if (!pendingSignupMobiles.has(mobile_number) || otp !== HARDCODED_OTP) {
      throw new CustomError(401, Messages.INVALID_OTP);
    }

    pendingSignupMobiles.delete(mobile_number);
    verifiedSignupMobiles.add(mobile_number);
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

    const token = signToken({ id: user.id, mobile_number });
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

  async sendLoginOtp(data: ILoginOtpRequest): Promise<{ otp: string }> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    validateMobileNumber(mobile_number);

    const user = await UserRepository.findByMobile(mobile_number);
    if (!user) {
      throw new CustomError(404, Messages.MOBILE_NOT_REGISTERED);
    }

    pendingLoginMobiles.add(mobile_number);

    return { otp: HARDCODED_OTP };
  }

  async login(data: ILoginRequest): Promise<IAuthResult> {
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    const { otp } = data;
    validateMobileNumber(mobile_number);

    const user = await UserRepository.findByMobile(mobile_number);
    if (!user || !pendingLoginMobiles.has(mobile_number) || otp !== HARDCODED_OTP) {
      throw new CustomError(401, Messages.INVALID_OTP);
    }

    pendingLoginMobiles.delete(mobile_number);

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
}

export default new AuthService();
