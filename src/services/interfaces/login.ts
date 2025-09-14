export interface LoginApiResponse {
  statusCode: number;
  data: Data;
  message: any;
}

export interface Data {
  id: number;
  logged: boolean;
  tokens: Tokens;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
