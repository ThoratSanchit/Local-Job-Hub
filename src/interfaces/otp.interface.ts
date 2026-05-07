export interface IOtp {
  id: string;
  mobile_number: string;
  otp: string;
  expires_at: Date;
}

export interface ICreateOtp {
  mobile_number: string;
  otp: string;
  expires_at: Date;
}
