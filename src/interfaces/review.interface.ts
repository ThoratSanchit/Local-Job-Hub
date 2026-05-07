export interface IReview {
  id: string;
  job_id: string;
  reviewer_id: string;
  worker_id: string;
  rating: number;
  comment: string | null;
}
