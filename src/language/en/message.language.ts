class Messages {
  // Generic
  static readonly INTERNAL_SERVER_ERROR = 'Internal Server Error';

  // Auth
  static readonly SIGNUP_SUCCESS = 'Account created successfully';
  static readonly LOGIN_SUCCESS = 'Login successful';
  static readonly INVALID_CREDENTIALS = 'Invalid email or password';
  static readonly INVALID_OTP_OR_MOBILE = 'Invalid mobile number or OTP';
  static readonly EMAIL_ALREADY_EXISTS = 'Email already registered';
  static readonly MOBILE_ALREADY_EXISTS = 'Mobile number already registered';

  // User
  static readonly USER_FETCHED_SUCCESSFULLY = 'User fetched successfully';
  static readonly USER_NOT_FOUND = 'User not found';
  static readonly ERROR_FETCHING_USER = 'An error occurred while fetching user';
  static readonly USER_CREATED_SUCCESSFULLY = 'User created successfully';
  static readonly USER_UPDATED_SUCCESSFULLY = 'User updated successfully';
  static readonly AVAILABILITY_UPDATED = 'Availability status updated';

  // Job
  static readonly JOB_CREATED = 'Job created successfully';
  static readonly JOB_FETCHED = 'Job fetched successfully';
  static readonly JOBS_FETCHED = 'Jobs fetched successfully';
  static readonly JOB_NOT_FOUND = 'Job not found';
  static readonly JOB_CANCELLED = 'Job cancelled successfully';
  static readonly JOB_COMPLETED = 'Job marked as completed';
  static readonly JOB_EXPIRED = 'Job has expired';
  static readonly JOB_ALREADY_FULL = 'Job is already full';
  static readonly JOB_NOT_OPEN = 'Job is not open for responses';
  static readonly JOB_UNAUTHORIZED = 'You are not the creator of this job';
  static readonly CANNOT_RESPOND_OWN_JOB = 'You cannot respond to your own job';

  // Job Response
  static readonly RESPONSE_SUBMITTED = 'Response submitted successfully';
  static readonly RESPONSE_ALREADY_EXISTS = 'You have already responded to this job';
  static readonly RESPONSE_NOT_FOUND = 'Response not found';
  static readonly WORKER_ACCEPTED = 'Worker accepted successfully';
  static readonly WORKER_REJECTED = 'Worker rejected';
  static readonly RESPONSE_NOT_PENDING = 'Response is not in pending state';

  // Message
  static readonly MESSAGE_SENT = 'Message sent successfully';
  static readonly MESSAGES_FETCHED = 'Messages fetched successfully';
  static readonly NOT_PARTICIPANT = 'You are not a participant in this job';

  // Review
  static readonly REVIEW_SUBMITTED = 'Review submitted successfully';
  static readonly REVIEW_ALREADY_EXISTS = 'You have already reviewed this worker for this job';
  static readonly JOB_NOT_COMPLETED = 'Job must be completed before reviewing';
  static readonly CANNOT_REVIEW_SELF = 'You cannot review yourself';
  static readonly NOT_JOB_CREATOR = 'Only the job creator can submit reviews';

  // Notification
  static readonly NOTIFICATIONS_FETCHED = 'Notifications fetched successfully';
  static readonly NOTIFICATION_MARKED_READ = 'Notification marked as read';
}

export default Messages;
