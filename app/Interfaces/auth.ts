export interface OtpResponse {
  sessionId: string;
  attemptsLeft: number;
  expiresAt: string;
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  message?: string;
}
