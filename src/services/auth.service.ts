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
import LocationService, { NormalizedLocation } from './location.service';

const HARDCODED_OTP = process.env.HARDCODED_OTP || '82081';

const pendingOtpMobiles = new Set<string>();
const verifiedSignupMobiles = new Set<string>();

const normalizeMobileNumber = (mobile_number: string) => mobile_number.trim();

const validateMobileNumber = (mobile_number: string) => {
  if (!/^[6-9]\d{9}$/.test(mobile_number)) {
    throw new CustomError(400, Messages.INVALID_MOBILE_NUMBER);
  }
};

const validateSkills = (skills?: string[] | null) => {
  if (
    skills !== undefined &&
    skills !== null &&
    (!Array.isArray(skills) || skills.some((skill) => typeof skill !== 'string'))
  ) {
    throw new CustomError(400, Messages.INVALID_SKILLS);
  }
};

const resolveSignupLocation = async (data: ISignupRequest): Promise<NormalizedLocation | null> => {
  const hasAnyCoordinate = data.latitude !== undefined && data.latitude !== null
    || data.longitude !== undefined && data.longitude !== null;
  const hasCoordinatePair = data.latitude !== undefined && data.latitude !== null
    && data.longitude !== undefined && data.longitude !== null;
  const hasAnyManualAddress = data.city !== undefined && data.city !== null
    || data.area !== undefined && data.area !== null
    || data.pincode !== undefined && data.pincode !== null;
  const hasManualAddress =
    typeof data.city === 'string' &&
    typeof data.area === 'string' &&
    typeof data.pincode === 'string';

  if (hasAnyCoordinate && hasAnyManualAddress) {
    throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
  }

  if (hasAnyCoordinate) {
    if (!hasCoordinatePair) {
      throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
    }

    return LocationService.reverseGeocode(Number(data.latitude), Number(data.longitude));
  }

  if (hasAnyManualAddress) {
    if (!hasManualAddress) {
      throw new CustomError(400, Messages.LOCATION_FIELDS_REQUIRED);
    }

    const { city, area, pincode } = data as { city: string; area: string; pincode: string };
    return LocationService.geocode(city, area, pincode);
  }

  return null;
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
        age: user.age,
        city: user.city,
        area: user.area,
        pincode: user.pincode,
        latitude: user.latitude,
        longitude: user.longitude,
        profile_photo: user.profile_photo,
        about_me: user.about_me,
        skills: user.skills,
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
    const {
      name,
      gender,
      age,
      city,
      area,
      pincode,
      latitude,
      longitude,
      profile_photo,
      about_me,
      skills
    } = data;
    const mobile_number = normalizeMobileNumber(data.mobile_number);
    validateMobileNumber(mobile_number);

    if (!verifiedSignupMobiles.has(mobile_number)) {
      throw new CustomError(401, Messages.SIGNUP_OTP_REQUIRED);
    }

    if (!Object.values(Gender).includes(gender)) {
      throw new CustomError(400, Messages.INVALID_GENDER);
    }

    validateSkills(skills);

    const existing = await UserRepository.findByMobile(mobile_number);
    if (existing) {
      throw new CustomError(409, Messages.MOBILE_ALREADY_EXISTS);
    }

    const location = await resolveSignupLocation(data);

    const user = await UserRepository.createUser({
      name,
      mobile_number,
      gender,
      age,
      city: location?.city ?? city ?? null,
      area: location?.area ?? area ?? null,
      pincode: location?.pincode ?? pincode ?? null,
      latitude: location?.latitude ?? latitude ?? null,
      longitude: location?.longitude ?? longitude ?? null,
      profile_photo: profile_photo || null,
      about_me: about_me ?? null,
      skills: skills ?? null,
      is_verified: true,
    });

    verifiedSignupMobiles.delete(mobile_number);

    return this.buildAuthResult(user);
  }
}

export default new AuthService();
