import { ComplaintReason, ComplaintType } from "../constants/complaints";
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
	state?: string;
	country?: string;
}

export interface UpdateUserResponse {
	message?: string;
}

export interface SubmitComplaintParams {
	type: ComplaintType;
	reason: ComplaintReason;
	details: string;
	shipmentReferenceNumber?: string;
	travellerReferenceNumber?: string;
	senderReferenceNumber?: string;
	attachmentUrls?: string[];
}

export interface SubmitComplaintResponse {
	message?: string;
}

export interface PresignedUrlInfo {
	slot: string;
	uploadUrl: string;
	key: string;
	fileUrl: string;
}

export interface GetComplaintAttachmentUploadUrlsResponse {
	urls: PresignedUrlInfo[];
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
	state: string;
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

	async submitComplaint(params: SubmitComplaintParams, accessToken: string) {
		return apiRequest<SubmitComplaintResponse>(API_ENDPOINTS.complaints.submitComplaint, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async getComplaintAttachmentUploadUrls(count: number, accessToken: string) {
		return apiRequest<GetComplaintAttachmentUploadUrlsResponse>(
			API_ENDPOINTS.complaints.getAttachmentUploadUrls(count),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},
};
