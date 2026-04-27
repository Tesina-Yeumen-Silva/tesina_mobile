export interface User {
  userId: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}
