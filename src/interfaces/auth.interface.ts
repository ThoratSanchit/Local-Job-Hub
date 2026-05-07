export interface ISignupRequest {
  name: string;
  mobile_number: string;
  city: string;
  area: string;
}

export interface ILoginRequest {
  mobile_number: string;
  otp: string;
}

export interface IAuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    mobile_number: string;
  };
}