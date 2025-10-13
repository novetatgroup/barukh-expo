export default interface OtpResponse {
  sessionId: string;
  attemptsLeft: number;
  expiresAt: string;
  message?: string;
}


export default interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  message?: string;
}
