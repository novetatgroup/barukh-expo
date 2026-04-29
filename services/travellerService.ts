import { API_ENDPOINTS, apiRequest } from "./api";
import type { GetShipmentsResponse } from "./senderService";

export interface CreateTravellerParams {
	userId: string;
}

export interface CreateTravellerResponse {
	travellerId: string;
	userId: string;
	status: string;
}

export interface TravellerProfile {
	travellerId: string;
	userId: string;
	status: string;
}

export interface CreateTripParams {
	userId: string;
	maxWeightKg: number;
	maxHeightCm: number;
	maxWidthCm: number;
	maxLengthCm: number;
	originCountry: string;
	originCity: string;
	destinationCountry: string;
	destinationCity: string;
	originLat?: number;
	originLon?: number;
	destinationLat?: number;
	destinationLon?: number;
	departureAt: string;
	arrivalAt: string;
	mode: string;
	flightNumber?: string;
	vehiclePlate?: string;
}

export interface CreateTripResponse {
	id: string;
	[key: string]: unknown;
}

export interface Trip {
	id: string;
	userId: string;
	originCountry: string;
	originCity: string;
	destinationCountry: string;
	destinationCity: string;
	departureAt: string;
	arrivalAt: string;
	mode: string;
	status: string;
	maxWeightKg: number;
	flightNumber?: string;
	vehiclePlate?: string;
	createdAt: string;
	updatedAt: string;
}

export interface TripDetails {
	id: string;
	maxWeightKg: number;
	maxHeightCm: number;
	maxWidthCm: number;
	maxLengthCm: number;
	originCountry: string;
	originCity: string;
	destinationCountry: string;
	destinationCity: string;
	departureAt: string;
	arrivalAt: string;
	mode: string;
	flightNumber?: string;
	vehiclePlate?: string;
	travellerId: string;
	status: string;
}

export interface GetTripsResponse {
	data: Trip[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface UpdateShipmentStatusParams {
	status: "INTRANSIT";
}

export interface ConfirmItemPickupParams {
	code: string;
	shipmentId: string;
}

export interface GetShipmentUploadUrlResponse {
	key: string;
	uploadUrl: string;
}

export interface ConfirmItemDeliveryParams {
	code: string;
	shipmentId: string;
	deliveryPhotoKey: string;
}

export const travellerService = {
	async createTraveller(params: CreateTravellerParams, accessToken: string) {
		return apiRequest<CreateTravellerResponse>(API_ENDPOINTS.traveller.createTraveller, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async createTrip(params: CreateTripParams, accessToken: string) {
		return apiRequest<CreateTripResponse>(API_ENDPOINTS.traveller.createTrip, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async getTrips(userId: string, accessToken: string) {
		return apiRequest<GetTripsResponse>(API_ENDPOINTS.traveller.getTrips(userId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async getTraveller(userId: string, accessToken: string) {
		console.log({userId,getTraveller: API_ENDPOINTS.traveller.getTraveller(userId), accessToken});

		return apiRequest<TravellerProfile>(API_ENDPOINTS.traveller.getTraveller(userId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async findTrip(tripId: string, accessToken: string) {
		return apiRequest<TripDetails>(API_ENDPOINTS.traveller.findTrip(tripId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async getTravellerShipments(travellerId: string, accessToken: string) {

		console.log({travellerId,getTravellerShipments: API_ENDPOINTS.shipments.listByRole(travellerId, "TRAVELLER"), accessToken});
		return apiRequest<GetShipmentsResponse>(
			API_ENDPOINTS.shipments.listByRole(travellerId, "TRAVELLER"),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},

	async updateShipmentStatus(
		shipmentId: string,
		params: UpdateShipmentStatusParams,
		accessToken: string
	) {
		return apiRequest(API_ENDPOINTS.shipments.update(shipmentId), {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async confirmItemPickup(params: ConfirmItemPickupParams, accessToken: string) {
		console.log({params,accessToken, url:API_ENDPOINTS.shipments.confirmItemPickup })
		return apiRequest<{ message?: string }>(API_ENDPOINTS.shipments.confirmItemPickup, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async getShipmentUploadUrl(shipmentId: string, accessToken: string) {
		return apiRequest<GetShipmentUploadUrlResponse>(
			API_ENDPOINTS.shipments.getUploadShipmentUrl(shipmentId),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},

	async confirmItemDelivery(params: ConfirmItemDeliveryParams, accessToken: string) {
		return apiRequest<{ message?: string }>(API_ENDPOINTS.shipments.confirmItemDelivery, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: params,
		});
	},

	async uploadImageToS3(imageUri: string, uploadUrl: string): Promise<void> {
		const fileResponse = await fetch(imageUri);
		const blob = await fileResponse.blob();
		const uploadResponse = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": "image/jpeg" },
			body: blob,
		});

		if (!uploadResponse.ok) {
			throw new Error(`S3 upload failed: HTTP ${uploadResponse.status}`);
		}
	},
};
