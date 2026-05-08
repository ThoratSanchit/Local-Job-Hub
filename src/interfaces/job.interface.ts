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

export interface IUpdateJobRequest {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  workers_required?: number;
  urgent?: boolean;
  expires_at?: string | null;
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
