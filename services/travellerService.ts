import { apiRequest, API_ENDPOINTS } from "./api";

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
};
