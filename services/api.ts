const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
	auth: {
		loginRequestOtp: "/auth/login/request-otp",
		registerRequestOtp: "/users/register/request-otp",
		verifyOtp: "/auth/verify-otp",
	},
	users: {
		get: (userId: string) => `/users/${userId}`,
		update: (userId: string) => `/users/update/${userId}`,
		createBankAccount: "/users/create-bank-account",
	},
	traveller: {
		createTraveller: "/traveller/create-traveller",
		createTrip: "/traveller/create-trip-localized/me",
		getTrips: "/traveller/get-trips/me",
		getTraveller: "/traveller/get-traveller/me",
		findTrip: (tripId: string) => `/traveller/find-trip/${tripId}`,
	},
	sender: {
		createSender: "/sender/create-sender",
		getSender: (userId: string) => `/sender/${userId}`,
		createPackage: "/sender/create-package",
		getPackages: (userId: string) => `/sender/${userId}/packages/all`,
	},
	matching: {
		autoAssign: (packageId: string) => `/matching/auto-assign/${packageId}`,
	},
	banks: {
		getSupportedAccounts: (countryCode: string) =>
			`/banks/get-supported-bank-accounts?country=${encodeURIComponent(countryCode)}`,
	},
	payments: {
		initiateCharge: "/payments/initiate-charge",
		nextAction: "/payments/next-action",
	},
	kyc: {
		getUploadUrls: (userId: string) => `/smile-id/upload-urls/${userId}`,
		submitVerification: "/smile-id/document-verification",
		getJobStatus: "/smile-id/get-job-status",
	},
	shipments: {
		findOne: (shipmentId: string) => `/shipments/find-one/${shipmentId}`,
		confirmItemPickup: "/shipments/confirm-item-pickup",
		getUploadShipmentUrl: (shipmentId: string) =>
			`/shipments/get-upload-shipment-url/${shipmentId}`,
		confirmItemDelivery: "/shipments/confirm-item-delivery",
		getItemPickupCode: (shipmentId: string) =>
			`/shipments/get-item-pickup-code/${shipmentId}`,
		getItemDeliveryCode: (shipmentId: string) =>
			`/shipments/get-item-delivery-code/${shipmentId}`,
		update: (shipmentId: string) => `/shipments/${shipmentId}`,
		listByRole: (actorId: string, role: "SENDER" | "TRAVELLER") =>
			`/shipments/${actorId}/?role=${role}`,
	},
	pushNotifications: {
		me: (page: number, limit: number) =>
			`/push-notifications/me?page=${page}&limit=${limit}`,
	},
} as const;

export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	ok: boolean;
	status: number;
	errorCode: string | null;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: object | FormData;
}

type ParsedResponseBody = Record<string, unknown> | unknown[] | string | number | boolean | null;

const DEFAULT_HEADERS: Record<string, string> = {
	"Content-Type": "application/json",
	"x-client-platform": "barukh_mobile",
};

const parseResponseBody = (rawResponseBody: string): ParsedResponseBody => {
	if (!rawResponseBody) {
		return null;
	}

	try {
		return JSON.parse(rawResponseBody) as ParsedResponseBody;
	} catch {
		return rawResponseBody;
	}
};

const getResponseMessage = (data: ParsedResponseBody): string => {
	if (data && typeof data === "object" && !Array.isArray(data)) {
		const responseData = data as Record<string, unknown>;
		const message = responseData.message || responseData.error;

		if (typeof message === "string") {
			return message;
		}

		if (Array.isArray(message)) {
			return message.map(String).join(", ");
		}
	}

	return "Request failed";
};

const getResponseErrorCode = (data: ParsedResponseBody): string | null => {
	if (!data || typeof data !== "object" || Array.isArray(data)) {
		return null;
	}

	const responseData = data as Record<string, unknown>;
	const errorCode = responseData.errorCode || responseData.code;

	return typeof errorCode === "string" ? errorCode : null;
};

export async function apiRequest<T>(
	endpoint: string,
	options: RequestOptions = {}
): Promise<ApiResponse<T>> {
	const { body, headers: customHeaders, ...restOptions } = options;

	const isFormData = body instanceof FormData;
	const headers: Record<string, string> = {
		...DEFAULT_HEADERS,
		...(isFormData ? { "Content-Type": undefined as unknown as string } : {}),
		...(customHeaders as Record<string, string>),
	};

	if (isFormData) {
		delete headers["Content-Type"];
	}

	const url = `${API_URL}${endpoint}`;
	try {
		const response = await fetch(url, {
			...restOptions,
			headers,
			body: isFormData ? body : body ? JSON.stringify(body) : undefined,
		});

		let data: T | null = null;
		const rawResponseBody = await response.text();
		const parsedResponseBody = parseResponseBody(rawResponseBody);

		if (parsedResponseBody !== null && typeof parsedResponseBody !== "string") {
			data = parsedResponseBody as T;
		}

		if (!response.ok) {
			return {
				data: null,
				error: getResponseMessage(parsedResponseBody),
				ok: false,
				status: response.status,
				errorCode: getResponseErrorCode(parsedResponseBody),
			};
		}

		return {
			data,
			error: null,
			ok: true,
			status: response.status,
			errorCode: null,
		};
	} catch {
		return {
			data: null,
			error: "Network error. Please try again later.",
			ok: false,
			status: 0,
			errorCode: null,
		};
	}
}

export { API_URL };
