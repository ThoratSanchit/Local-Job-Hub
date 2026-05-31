import { Gender } from "../enums/gender.enum";

export interface ISignupRequest {
  name: string;
  mobile_number: string;
  gender: Gender;
  age: number;
  city?: string | null;
  area?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  profile_photo?: string;
  about_me?: string | null;
  skills?: string[] | null;
}

export interface IOtpRequest {
  mobile_number: string;
}

export interface IVerifyOtpRequest {
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
    age: number;
    city: string | null;
    area: string | null;
    pincode: string | null;
    latitude: number | null;
    longitude: number | null;
    profile_photo: string | null;
    about_me: string | null;
    skills: string[] | null;
  };
}

export interface IVerifyOtpResult {
  is_registered: boolean;
  signup_required: boolean;
  token?: string;
  user?: IAuthResult['user'];
}
