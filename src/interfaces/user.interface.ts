import { AvailabilityStatus } from '../models/user.model';

export interface IUser {
  id: string;
  name: string;
  mobile_number: string;
  city: string;
  area: string;
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
  city: string;
  area: string;
  is_onboarded?: boolean;
}

export interface IUpdateUser {
  name?: string;
  mobile_number?: string;
  city?: string;
  area?: string;
  rating?: number;
  total_jobs_completed?: number;
  completion_rate?: number;
  is_verified?: boolean;
  is_onboarded?: boolean;
  availability_status?: AvailabilityStatus;
}
