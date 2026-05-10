import { Gender } from "../enums/gender.enum";

export interface ISignupRequest {
  name: string;
  mobile_number: string;
  gender: Gender;
  city: string;
  area: string;
  profile_photo?: string;
}

export interface ISignupOtpRequest {
  mobile_number: string;
}

export interface IVerifySignupOtpRequest {
  mobile_number: string;
  otp: string;
}

export interface ILoginOtpRequest {
  mobile_number: string;
}

export interface ILoginRequest {
  mobile_number: string;
  otp: string;
}
export interface IAuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    mobile_number: string;
    gender: Gender;
    profile_photo: string | null;
  };
}
