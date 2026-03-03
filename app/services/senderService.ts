import { apiRequest, API_ENDPOINTS } from "./api";

export interface CreateSenderParams {
	userId: string;
}

export interface CreateSenderResponse {
	senderId: string;
	message: string;
}

export interface CreatePackageParams {
	userId: string;
	name: string;
	category: string;
	weightKg: number;
	lengthCm: number;
	widthCm: number;
	heightCm: number;
	fragile: boolean;
	quantity: number;
	originCountry: string;
	originCity: string;
	originLat?: number;
	originLon?: number;
	destinationCountry: string;
	destinationCity: string;
	destinationLat?: number;
	destinationLon?: number;
	urgencyLevel: number;
	requiredByDate: string;
}

export interface CreatePackageResponse {
	id: string;
	senderId: string;
	name: string;
	category: number;
	weightKg: number;
	lengthCm: number;
	widthCm: number;
	heightCm: number;
	fragile: boolean;
	quantity: number;
	originCountry: string;
	originCity: string;
	destinationCountry: string;
	destinationCity: string;
	photoUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface AutoAssignParams {
	packageId: string;
}

export interface AutoAssignResponse {
	packageId: string;
	tripId: string;
	strategyUsed?: string;
	reason?: string;
	retryScheduled?: boolean;
	processingTimeMs?: number;
}

export interface GetSenderResponse {
	senderId: string;
	userId: string;
}

export const senderService = {
	async getSender(userId: string, accessToken: string) {
		return apiRequest<GetSenderResponse>(API_ENDPOINTS.sender.getSender(userId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async createSender(params: CreateSenderParams, accessToken: string) {
		return apiRequest<CreateSenderResponse>(API_ENDPOINTS.sender.createSender, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async createPackage(params: CreatePackageParams, accessToken: string) {
		return apiRequest<CreatePackageResponse>(API_ENDPOINTS.sender.createPackage, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async autoAssign(params: AutoAssignParams, accessToken: string) {
		return apiRequest<AutoAssignResponse>(API_ENDPOINTS.matching.autoAssign, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},
};
