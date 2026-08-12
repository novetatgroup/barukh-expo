import { API_ENDPOINTS, apiRequest } from "./api";

export interface CreateSenderParams {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
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
	imageKey?: string;
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

export interface AutoAssignedTrip {
	id: string;
	travellerId: string;
	travellerFirstName: string;
	travellerLastName: string;
	originLat: number;
	originLon: number;
	destinationLat: number;
	destinationLon: number;
	originDistanceKm: number;
	destinationDistanceKm: number;
	remainingCapacity: number;
	maxWeightKg: number;
	maxLengthCm: number;
	maxWidthCm: number;
	maxHeightCm: number;
}

export interface AutoAssignResponse {
	trip: AutoAssignedTrip | null;
}

export interface ShipmentDetails {
	id: string;
	senderId: string;
	travellerId: string;
	packageId: string;
	tripId: string;
	status: string;
	priceMinor: number;
	currency: string;
	requestedAt: string;
	package: {
		id: string;
		name: string;
		category: string;
		weightKg: number;
		originCity: string;
		destinationCity: string;
		photoUrl: string;
	};
	travel: {
		id: string;
		originCity: string;
		destinationCity: string;
		departureAt: string;
		arrivalAt: string;
		mode: string;
	};
	sender: { id: string; userId: string };
	traveller: { id: string; userId: string };
	deliveryPhotoUrl?: string | null;
}

export interface GetShipmentsResponse {
	data: ShipmentDetails[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface GetSenderResponse {
	senderId: string;
	userId: string;
}

export interface ShipmentCodeResponse {
	code: string;
}

export interface Package {
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

export interface GetPackagesResponse {
	data: Package[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
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

	async getPackages(userId: string, accessToken: string) {
		return apiRequest<GetPackagesResponse>(API_ENDPOINTS.sender.getPackages(userId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async autoAssign(packageId: string, radiusKm: number, accessToken: string) {
		const endpoint = `${API_ENDPOINTS.matching.autoAssign(packageId)}` +
			`?max-origin-distance=${radiusKm}&max-destination-distance=${radiusKm}`;

		return apiRequest<AutoAssignResponse>(endpoint, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	async getShipment(shipmentId: string, accessToken: string) {
		return apiRequest<ShipmentDetails>(API_ENDPOINTS.shipments.findOne(shipmentId), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
	},

	// TODO(izaiah): confirm the exact endpoint/status transition contract for
	// traveller-confirms-transport. Placeholder until backend responds.
	async travellerConfirmShipment(shipmentId: string, accessToken: string) {
		return apiRequest<{ message?: string; status?: string }>(
			API_ENDPOINTS.shipments.travellerConfirm(shipmentId),
			{
				method: "POST",
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
	},

	async submitReview(
		input: { shipmentId: string; rating: number; comment: string },
		accessToken: string,
	) {
		return apiRequest<{ message?: string; review_id?: string }>(
			API_ENDPOINTS.shipments.submitReview,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${accessToken}` },
				body: input,
			},
		);
	},

	async getPickupCode(shipmentId: string, accessToken: string) {
		return apiRequest<ShipmentCodeResponse>(
			API_ENDPOINTS.shipments.getItemPickupCode(shipmentId),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},

	async getDeliveryCode(shipmentId: string, accessToken: string) {
		return apiRequest<ShipmentCodeResponse>(
			API_ENDPOINTS.shipments.getItemDeliveryCode(shipmentId),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},

	async getSenderShipments(senderId: string, accessToken: string) {
		return apiRequest<GetShipmentsResponse>(
			API_ENDPOINTS.shipments.listByRole(senderId, "SENDER"),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},
};
