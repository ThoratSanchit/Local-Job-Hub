import { ResponseStatus } from '../models/jobResponse.model';

export interface IJobResponse {
  id: string;
  job_id: string;
  worker_id: string;
  status: ResponseStatus;
}
