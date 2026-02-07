const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
	auth: {
		loginRequestOtp: "/auth/login/request-otp",
		registerRequestOtp: "/users/register/request-otp",
		verifyOtp: "/auth/verify-otp",
	},
	users: {
		update: (userId: string) => `/users/update/${userId}`,
	},
} as const;

interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	ok: boolean;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: object | FormData;
}

const DEFAULT_HEADERS: Record<string, string> = {
	"Content-Type": "application/json",
	"x-client-platform": "barukh_mobile",
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

	try {
		const response = await fetch(`${API_URL}${endpoint}`, {
			...restOptions,
			headers,
			body: isFormData ? body : body ? JSON.stringify(body) : undefined,
		});

		let data: T | null = null;
		const contentType = response.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			data = await response.json();
		}

		if (!response.ok) {
			const errorMessage =
				(data as Record<string, unknown>)?.message ||
				(data as Record<string, unknown>)?.error ||
				"Request failed";
			return {
				data: null,
				error: String(errorMessage),
				ok: false,
			};
		}

		return { data, error: null, ok: true };
	} catch (error) {
		console.error("API request error:", error);
		return {
			data: null,
			error: "Network error. Please try again later.",
			ok: false,
		};
	}
}

export { API_URL };
