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
	city?: string;
	country?: string;
}

export interface UpdateUserResponse {
	message?: string;
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
	postalCode: string;
	city: string;
	country: string;
	isKycVerified: boolean;
}

export const userService = {
	async getUser(userId: string, accessToken: string) {
		return apiRequest<UserProfile>(API_ENDPOINTS.users.get(userId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async updateProfile(userId: string, params: UpdateProfileParams, accessToken: string) {
		return apiRequest<UpdateUserResponse>(API_ENDPOINTS.users.update(userId), {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async updateRole(userId: string, role: Role, accessToken: string) {
		return apiRequest<UpdateUserResponse>(API_ENDPOINTS.users.update(userId), {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: { role },
		});
	},
};
