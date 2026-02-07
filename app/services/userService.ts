import { Role } from "../constants/roles";
import { apiRequest, API_ENDPOINTS } from "./api";

export interface UpdateUserParams {
	role?: Role;
}

export interface UpdateUserResponse {
	message?: string;
}

export const userService = {
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
