export interface RefreshApiResponse {
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
}
