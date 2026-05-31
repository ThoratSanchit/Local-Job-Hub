class Messages {
  // Generic
  static readonly INTERNAL_SERVER_ERROR = 'Internal Server Error';

  // Auth
  static readonly SIGNUP_SUCCESS = 'User Signup Successfully';
  static readonly OTP_SENT = 'OTP sent successfully';
  static readonly OTP_VERIFIED = 'OTP verified successfully';
  static readonly PROFILE_PHOTO_UPLOADED = 'Profile photo uploaded successfully';
  static readonly PROFILE_PHOTO_REQUIRED = 'Profile photo is required';
  static readonly PROFILE_PHOTO_TOO_LARGE = 'Profile photo must be 5 MB or less';
  static readonly SIGNUP_OTP_REQUIRED = 'Please verify mobile number OTP before signup';
  static readonly LOGIN_SUCCESS = 'User Login Successfully';
  static readonly LOGIN_OTP_SENT = 'Login OTP sent successfully';
  static readonly MOBILE_NOT_REGISTERED = 'Mobile number is not registered. Please sign up first';
  static readonly INVALID_CREDENTIALS = 'Invalid email or password';
  static readonly INVALID_OTP = 'Invalid OTP. Please enter a valid OTP';
  static readonly INVALID_MOBILE_NUMBER = 'Mobile number must be a valid 10 digit number';
  static readonly INVALID_GENDER = 'Gender must be male or female';
  static readonly EMAIL_ALREADY_EXISTS = 'Email already registered';
  static readonly MOBILE_ALREADY_EXISTS = 'Mobile number already registered';

  // User
  static readonly USER_FETCHED_SUCCESSFULLY = 'User fetched successfully';
  static readonly USER_NOT_FOUND = 'User not found';
  static readonly ERROR_FETCHING_USER = 'An error occurred while fetching user';
  static readonly USER_CREATED_SUCCESSFULLY = 'User created successfully';
  static readonly USER_UPDATED_SUCCESSFULLY = 'User updated successfully';
  static readonly AVAILABILITY_UPDATED = 'Availability status updated';
  static readonly INVALID_AVAILABILITY_STATUS = 'Invalid availability_status';
  static readonly INVALID_SKILLS = 'Skills must be an array of strings';
  static readonly LOCATION_UPDATED_SUCCESSFULLY = 'Location updated successfully';
  static readonly LOCATIONIQ_API_KEY_MISSING = 'LocationIQ API key is not configured';
  static readonly LOCATION_LOOKUP_FAILED = 'Unable to fetch location details';
  static readonly LOCATION_NOT_FOUND = 'Location not found';
  static readonly INVALID_COORDINATES = 'Latitude and longitude must be valid coordinates';
  static readonly LOCATION_FIELDS_REQUIRED = 'City, area and pincode are required';
  static readonly INVALID_LOCATION_PAYLOAD = 'Send either latitude and longitude, or city, area and pincode';

  // Job
  static readonly JOB_CREATED = 'Job created successfully';
  static readonly JOB_UPDATED = 'Job updated successfully';
  static readonly JOB_FETCHED = 'Job fetched successfully';
  static readonly JOBS_FETCHED = 'Jobs fetched successfully';
  static readonly RECENT_SEARCHES_FETCHED = 'Recent searches fetched successfully';
  static readonly JOB_NOT_FOUND = 'Job not found';
  static readonly INVALID_CURSOR = 'Invalid cursor';
  static readonly JOB_CANCELLED = 'Job cancelled successfully';
  static readonly JOB_COMPLETED = 'Job marked as completed';
  static readonly JOB_EXPIRED = 'Job has expired';
  static readonly JOB_ALREADY_FULL = 'Job is already full';
  static readonly JOB_NOT_OPEN = 'Job is not open for responses';
  static readonly JOB_UNAUTHORIZED = 'You are not the creator of this job';
  static readonly JOB_CANCEL_INVALID_STATE = 'Job cannot be cancelled in its current state';
  static readonly JOB_COMPLETE_INVALID_STATE = 'Job must be FULL or PARTIALLY_ACCEPTED to complete';
  static readonly EXPIRES_AT_MUST_BE_FUTURE = 'expires_at must be in the future';
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
