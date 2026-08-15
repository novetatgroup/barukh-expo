import { Role } from "../constants/roles";
import { apiRequest, API_ENDPOINTS } from "./api";

export interface UpdateUserParams {
	role?: Role;
}

export interface UpdateProfileParams {
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	emergencyContact?: string;
	addressLineA?: string;
	addressLineB?: string;
	postalCode?: string;
	city?: string;
	country?: string;
}

export interface UpdateUserResponse {
	message?: string;
}

export interface FlwCustomerObject {
	flwCustomerId: string;
	flwPaymentCardId?: string;
	flwPaymentCardLast4?: string;
	flwPaymentCardHolderName?: string;
	flwPaymentCardIsDefault?: boolean;
}

export interface UserProfile {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	isActive: boolean;
	profilePicture: string;
	phoneNumber: string;
	isPhoneVerified: boolean;
	emergencyContact: string;
	addressLineA: string;
	addressLineB: string;
	postalCode: string;
	city: string;
	country: string;
	isKycVerified: boolean;
	flwCustomerObject?: FlwCustomerObject;
}

export const userService = {
	async getUser(_userId: string, accessToken: string) {
		return apiRequest<UserProfile>(API_ENDPOINTS.users.get, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async updateProfile(_userId: string, params: UpdateProfileParams, accessToken: string) {
		return apiRequest<UpdateUserResponse>(API_ENDPOINTS.users.update, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async updateRole(_userId: string, role: Role, accessToken: string) {
		return apiRequest<UpdateUserResponse>(API_ENDPOINTS.users.update, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: { role },
		});
	},
};
