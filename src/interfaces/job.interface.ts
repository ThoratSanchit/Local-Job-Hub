import { JobStatus } from '../constants/job.constants';

export interface IJob {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  payment_type: string | null;
  work_duration: string | null;
  start_date: string | null;
  preferred_time: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  area: string;
  created_by: string;
  workers_required: number;
  status: JobStatus;
  urgent: boolean;
  expires_at: Date | null;
  need_workers_immediately: boolean;
  requirements: string[] | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateJobRequest {
  title: string;
  description: string;
  category: string;
  price: number;
  payment_type?: string;
  work_duration?: string;
  start_date?: string;
  preferred_time?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;
  workers_required?: number;
  urgent?: boolean;
  expires_at?: string;
  need_workers_immediately?: boolean;
  requirements?: string[];
  city?: string;
  area?: string;
}
export interface ICreateJobData {
  title: string;
  description: string;
  category: string;
  price: number;
  payment_type: string | null;
  work_duration: string | null;
  start_date: string | null;
  preferred_time: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  area: string;
  created_by: string;
  workers_required: number;
  status: JobStatus;
  urgent: boolean;
  expires_at: Date | null;
  need_workers_immediately: boolean;
  requirements: string[] | null;
}

export interface IUpdateJobRequest {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  payment_type?: string | null;
  work_duration?: string | null;
  start_date?: string | null;
  preferred_time?: string | null;
  full_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  workers_required?: number;
  urgent?: boolean;
  expires_at?: string | null;
  need_workers_immediately?: boolean;
  requirements?: string[] | null;
  city?: string;
  area?: string;
}

export interface IJobParams {
  id: string;
}

export interface ICancelJobRequest {
  reason?: string;
}

export interface IUpdateJobData {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  payment_type?: string | null;
  work_duration?: string | null;
  start_date?: string | null;
  preferred_time?: string | null;
  full_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  workers_required?: number;
  urgent?: boolean;
  expires_at?: Date | null;
  need_workers_immediately?: boolean;
  requirements?: string[] | null;
  city?: string;
  area?: string;
}

export interface IJobUpdateData extends IUpdateJobData {
  status?: JobStatus;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
}

export interface ISearchJobRequest {
  keyword?: string;
  category?: string;
  city?: string;
  area?: string;
}
