import { JobStatus } from '../constants/job.constants';

export interface IJob {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  area: string;
  created_by: string;
  workers_required: number;
  status: JobStatus;
  urgent: boolean;
  expires_at: Date | null;
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
  workers_required?: number;
  urgent?: boolean;
  expires_at?: string;
}
export interface ICreateJobData {
  title: string;
  description: string;
  category: string;
  price: number;
  city: string;
  area: string;
  created_by: string;
  workers_required: number;
  status: JobStatus;
  urgent: boolean;
  expires_at: Date | null;
}

export interface IUpdateJobRequest {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  workers_required?: number;
  urgent?: boolean;
  expires_at?: string | null;
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
  workers_required?: number;
  urgent?: boolean;
  expires_at?: Date | null;
}

export interface IJobUpdateData extends IUpdateJobData {
  status?: JobStatus;
  cancelled_by?: string | null;
  cancellation_reason?: string | null;
}
