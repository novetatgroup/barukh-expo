import { API_ENDPOINTS, apiRequest } from "./api";

export interface PushNotificationPayload {
	id?: string;
	_id?: string;
	title?: string;
	body?: string;
	message?: string;
	type?: string;
	isRead?: boolean;
	read?: boolean;
	readAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
	data?: Record<string, unknown>;
}

export interface PushNotification extends PushNotificationPayload {
	notification?: PushNotificationPayload;
}

export interface NotificationsMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface GetNotificationsResponse {
	data: PushNotification[];
	meta: NotificationsMeta;
}

export const notificationService = {
	async getMyNotifications(page: number, limit: number, accessToken: string) {
		return apiRequest<GetNotificationsResponse>(
			API_ENDPOINTS.pushNotifications.me(page, limit),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
	},
};
