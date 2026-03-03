import { OtpResponse, VerifyOtpResponse } from "../Interfaces/auth";
import { apiRequest, API_ENDPOINTS } from "./api";

export interface RequestOtpParams {
	email: string;
	name?: string;
}

export interface VerifyOtpParams {
	otpCode: string;
	sessionId: string;
}

export const authService = {
	async requestLoginOtp(email: string) {
		return apiRequest<OtpResponse>(API_ENDPOINTS.auth.loginRequestOtp, {
			method: "POST",
			body: { email },
		});
	},

	async requestRegisterOtp(params: RequestOtpParams) {
		return apiRequest<OtpResponse>(API_ENDPOINTS.auth.registerRequestOtp, {
			method: "POST",
			body: params,
		});
	},

	async verifyOtp(params: VerifyOtpParams) {
		return apiRequest<VerifyOtpResponse>(API_ENDPOINTS.auth.verifyOtp, {
			method: "POST",
			credentials: "include",
			body: params,
		});
	},

	async resendOtp(flow: "login" | "register", email: string) {
		if (flow === "register") {
			return this.requestRegisterOtp({ email });
		}
		return this.requestLoginOtp(email);
	},
};
