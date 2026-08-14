const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
	auth: {
		loginRequestOtp: "/auth/login/request-otp",
		registerRequestOtp: "/users/register/request-otp",
		verifyOtp: "/auth/verify-otp",
	},
	users: {
		get: "/users/profile/me",
		update: "/users/update/profile/me",

		// Bank and Card stuff.
		createBankAccount: "/users/create-bank-account",
		listBankAccounts: "/users/bank-accounts/me",
		updateBankAccount: (bankAccountId: string) => `/users/update-bank-account/me/${bankAccountId}`,
		deleteBankAccount: (bankAccountId: string) => `/users/delete-bank-accounts/me/${bankAccountId}`,
		setDefaultBankAccount: (bankAccountId: string) => `/users/update-bank-account/me/${bankAccountId}`,
		createPaymentCard: "/users/create-payment-card",
		getPaymentCards: "/users/user-cards/me",
		deletePaymentCard: (id: string) => `/users/delete-payment-card/${id}`,

		// To be implemented on BE
		createAddress: "/users/create-address",
		updateAddress: "/users/update-address",
		getAddresses: "/users/get-addresses/me",
		getSingleAddress: (id: string) => `/users/get-address/${id}`,
		deleteAddress: (id: string) => `/users/delete-address/${id}`
	},
	traveller: {
		createTraveller: "/travellers/create-traveller-localized/me",
		createTrip: "/travellers/create-trip-localized/me",
		getTrips: "/travellers/get-trips/me",
		getTraveller: "/travellers/get-traveller/me",
		findTrip: (tripId: string) => `/travellers/find-trip/${tripId}`,
	},
	sender: {
		createSender: "/senders/create-sender-localized/me",
		getSender: "/senders/get-sender/me",
		createPackage: "/senders/create-package-localized/me",
		getPackages: "/senders/packages/me",
		getPackage: (packageId: string) => `/senders/get-package/${packageId}`
	},
	matching: {
		autoAssign: (packageId: string) => `/matching/auto-assign/${packageId}`,
	},
	banks: {
		getSupportedAccounts: (countryCode: string) =>
			`/banks/get-supported-bank-accounts?country=${encodeURIComponent(countryCode)}`,
		getBankBranchesInfo: (supportedBankId: number) => `/banks/get-supported-bank-branches/${supportedBankId}`
	},
	payments: {
		initiateCharge: "/payments/initiate-charge",
		nextAction: "/payments/next-action",
	},
	kyc: {
		getUploadUrls: (userId: string) => `/smile-id/upload-urls/${userId}`,
		submitVerification: "/smile-id/document-verification",
		getJobStatus: "/smile-id/get-job-status",
		kycVerifyOtp: "/kyc/verify-otp",
		requestPhoneNumberOtpKyc: "/kyc/request-otp",
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
		submitReview: "/shipments/submit-review",
		travellerConfirm: (shipmentId: string) =>
			`/shipments/${shipmentId}/traveller-confirm`,
	},
	pushNotifications: {
		me: (page: number, limit: number) =>
			`/push-notifications/me?page=${page}&limit=${limit}`,
		markNotificationsAsRead: "/push-notifications/mark-read"
	},
	complaints: {
		submitComplaint: '/users/submit-complaint'
	}
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
