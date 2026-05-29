import { AvailabilityStatus } from "../enums/availability.status.enum";
import { Gender } from "../enums/gender.enum";

export interface IUser {
  id: string;
  name: string;
  mobile_number: string;
  gender: Gender;
  age: number;
  city: string | null;
  area: string | null;
  pincode: string | null;
  rating: number;
  total_jobs_completed: number;
  completion_rate: number;
  is_verified: boolean;
  is_onboarded: boolean;
  availability_status: AvailabilityStatus;
}

export interface ICreateUser {
  name: string;
  mobile_number: string;
  gender: Gender;
  age: number;
  city?: string | null;
  area?: string | null;
  pincode?: string | null;
  is_onboarded?: boolean;
}

export interface IUpdateUser {
  name?: string;
  mobile_number?: string;
  gender?: Gender;
  age?: number;
  city?: string | null;
  area?: string | null;
  pincode?: string | null;
  rating?: number;
  total_jobs_completed?: number;
  completion_rate?: number;
  is_verified?: boolean;
  is_onboarded?: boolean;
  availability_status?: AvailabilityStatus;
}

export interface IUserParams {
  id: string;
}
