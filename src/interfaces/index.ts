export interface IUser {
  id: string;
  name: string;
  email: string;
  city: string;
  area: string;
  rating: number;
  total_jobs_completed: number;
  is_verified: boolean;
  is_onboarded: boolean;
  availability_status: 'ONLINE' | 'OFFLINE';
}

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
  status: string;
  urgent: boolean;
  expires_at: Date | null;
}
