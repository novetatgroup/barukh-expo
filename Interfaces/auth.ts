export interface OtpResponse {
	sessionId: string;
	attemptsLeft: number;
	expiresAt: string;
	maskedContact?: string;
	method?: string;
	message?: string;
}

export interface VerifyOtpResponse {
	accessToken: string;
	refreshToken: string;
	message?: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
}

export interface ApiErrorResponse {
	message?: string;
	error?: string;
}
