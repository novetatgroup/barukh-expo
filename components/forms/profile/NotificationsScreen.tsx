import CustomButton from "@/components/ui/CustomButton";
import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import {
	notificationService,
	PushNotification,
} from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Toast } from "toastify-react-native";

const PAGE_LIMIT = 15;

const getNotificationPayload = (notification: PushNotification) =>
	notification.notification || notification;

const getNotificationMessage = (notification: PushNotification) => {
	const payload = getNotificationPayload(notification);

	return payload.body || payload.message || "You have a new notification.";
};

const getNotificationType = (notification: PushNotification) =>
	getNotificationStringValue(notification, "type");

const formatNotificationType = (type: string) =>
	type
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

const getNotificationTitle = (notification: PushNotification) => {
	const payload = getNotificationPayload(notification);

	return payload.title || payload.type || "Notification";
};

const getNotificationTime = (notification: PushNotification) => {
	const payload = getNotificationPayload(notification);
	const dateValue = payload.createdAt || payload.updatedAt;

	if (!dateValue) {
		return "";
	}

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

const getNotificationId = (notification: PushNotification) => {
	const payload = getNotificationPayload(notification);

	return notification.id || notification._id || payload.id || payload._id;
};

const getNotificationKey = (notification: PushNotification, index: number) => {
	const notificationId = getNotificationId(notification);

	if (notificationId) {
		return `${notificationId}-${index}`;
	}

	const payload = getNotificationPayload(notification);

	return [
		"notification",
		payload.createdAt || payload.updatedAt || "unknown-time",
		payload.type || "unknown-type",
		index,
	].join("-");
};

const markNotificationAsReadLocally = (
	notification: PushNotification
): PushNotification =>
	notification.notification
		? {
				...notification,
				notification: { ...notification.notification, isRead: true, read: true },
			}
		: { ...notification, isRead: true, read: true };

const getNotificationStringValue = (
	notification: PushNotification,
	key: string
) => {
	const payload = getNotificationPayload(notification);
	const directValue = (notification as Record<string, unknown>)[key];
	const payloadValue = (payload as Record<string, unknown>)[key];
	const dataValue = notification.data?.[key] ?? payload.data?.[key];
	const value = directValue ?? payloadValue ?? dataValue;

	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number") {
		return String(value);
	}

	return undefined;
};

const isUnreadNotification = (notification: PushNotification) => {
	const payload = getNotificationPayload(notification);

	return (
		payload.isRead === false ||
		payload.read === false ||
		(!payload.isRead && !payload.read && !payload.readAt)
	);
};

const NotificationsScreen = () => {
	const router = useRouter();
	const { accessToken } = useContext(AuthContext);
	const [notifications, setNotifications] = useState<PushNotification[]>([]);
	const [page, setPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [selectedNotification, setSelectedNotification] =
		useState<PushNotification | null>(null);
	const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

	const fetchNotifications = useCallback(
		async (pageToLoad = 1, shouldRefresh = false) => {
			if (!accessToken) {
				setLoading(false);
				setRefreshing(false);
				setLoadingMore(false);
				return;
			}

			if (pageToLoad === 1 && !shouldRefresh) {
				setLoading(true);
			}

			if (shouldRefresh) {
				setRefreshing(true);
			}

			if (pageToLoad > 1) {
				setLoadingMore(true);
			}

			const { data, ok, error } = await notificationService.getMyNotifications(
				pageToLoad,
				PAGE_LIMIT,
				accessToken
			);

			if (ok && data) {
				setNotifications((current) =>
					pageToLoad === 1 ? data.data : [...current, ...data.data]
				);
				setPage(data.meta.page);
				setHasNextPage(data.meta.hasNextPage);
				setUnreadCount(
					typeof data.unreadCount === "number"
						? data.unreadCount
						: data.data.filter(isUnreadNotification).length
				);
			} else if (error) {
				Toast.error(error);
			}

			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		},
		[accessToken]
	);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	const handleRefresh = () => {
		fetchNotifications(1, true);
	};

	const handleLoadMore = () => {
		if (!hasNextPage || loadingMore || loading || refreshing) {
			return;
		}

		fetchNotifications(page + 1);
	};

	const goToDetails = (notification: PushNotification) => {
		const conversationId = getNotificationStringValue(
			notification,
			"conversationId"
		);
		const receiverId = getNotificationStringValue(notification, "receiverId");
		const receiverName =
			getNotificationStringValue(notification, "receiverName") || receiverId;

		if (conversationId && receiverId) {
			router.push({
				pathname: "/(chat)/[conversationId]",
				params: {
					conversationId,
					receiverId,
					receiverName,
				},
			});
			return;
		}

		const shipmentId =
			getNotificationStringValue(notification, "shipmentId") ||
			getNotificationStringValue(notification, "shipment_id");
		const role = getNotificationStringValue(notification, "role")?.toUpperCase();

		if (shipmentId) {
			if (role === "TRAVELLER") {
				router.push({
					pathname: "/(traveller)/shipmentDetails",
					params: {
						id: shipmentId,
						shipmentId,
					},
				});
				return;
			}

			router.push({
				pathname: "/(sender)/shipmentDetails",
				params: {
					id: shipmentId,
					shipmentId,
				},
			});
			return;
		}

		const packageId =
			getNotificationStringValue(notification, "packageId") ||
			getNotificationStringValue(notification, "package_id");

			if (packageId) {
				const senderId =
					getNotificationStringValue(notification, "senderId") ||
					getNotificationStringValue(notification, "sender_id");
				router.push({
					pathname: "/(sender)/findingTraveller",
					params: { packageId, ...(senderId ? { senderId } : {}) },
				});
			return;
		}

		Toast.info("No details available for this notification.");
	};

	const hasNavigableTarget = (notification: PushNotification) =>
		Boolean(
			(getNotificationStringValue(notification, "conversationId") &&
				getNotificationStringValue(notification, "receiverId")) ||
				getNotificationStringValue(notification, "shipmentId") ||
				getNotificationStringValue(notification, "shipment_id") ||
				getNotificationStringValue(notification, "packageId") ||
				getNotificationStringValue(notification, "package_id")
		);

	const markNotificationsAsRead = async (ids: string[]) => {
		if (!accessToken || ids.length === 0) return;

		const { ok, error } = await notificationService.markAsRead(ids, accessToken);

		if (!ok) {
			Toast.error(error || "Unable to mark notification as read.");
			return;
		}

		setNotifications((current) =>
			current.map((notification) =>
				ids.includes(getNotificationId(notification) || "")
					? markNotificationAsReadLocally(notification)
					: notification
			)
		);
		setUnreadCount((current) => Math.max(0, current - ids.length));
	};

	const openNotification = (notification: PushNotification) => {
		setSelectedNotification(notification);

		const notificationId = getNotificationId(notification);
		if (notificationId && isUnreadNotification(notification)) {
			void markNotificationsAsRead([notificationId]);
		}
	};

	const closeDetails = () => setSelectedNotification(null);

	const handleViewRelatedItem = () => {
		if (!selectedNotification) return;
		const notification = selectedNotification;
		closeDetails();
		goToDetails(notification);
	};

	const handleMarkAllAsRead = async () => {
		if (markingAllAsRead || unreadCount === 0) return;

		const unreadIds = notifications
			.filter(isUnreadNotification)
			.map(getNotificationId)
			.filter((id): id is string => Boolean(id));

		if (unreadIds.length === 0) return;

		setMarkingAllAsRead(true);
		await markNotificationsAsRead(unreadIds);
		setMarkingAllAsRead(false);
	};

	const renderNotification = ({ item }: { item: PushNotification }) => {
		const unread = isUnreadNotification(item);
		const time = getNotificationTime(item);
		const type = getNotificationType(item);

		return (
			<TouchableOpacity
				activeOpacity={0.85}
				style={styles.notificationCard}
				onPress={() => openNotification(item)}
			>
				<View style={styles.iconContainer}>
					<Ionicons
						name={unread ? "notifications" : "notifications-outline"}
						size={22}
						color={Theme.colors.primary}
					/>
				</View>
				<View style={styles.notificationContent}>
					<View style={styles.notificationHeader}>
						<Text style={styles.notificationTitle} numberOfLines={1}>
							{getNotificationTitle(item)}
						</Text>
						{time ? <Text style={styles.notificationTime}>{time}</Text> : null}
					</View>
					{type ? (
						<View style={styles.typeTag}>
							<Text style={styles.typeTagText}>
								{formatNotificationType(type)}
							</Text>
						</View>
					) : null}
					<Text style={styles.notificationMessage} numberOfLines={3}>
						{getNotificationMessage(item)}
					</Text>
				</View>
				{unread ? <View style={styles.unreadDot} /> : null}
			</TouchableOpacity>
		);
	};

	const selectedType = selectedNotification
		? getNotificationType(selectedNotification)
		: undefined;
	const selectedTime = selectedNotification
		? getNotificationTime(selectedNotification)
		: "";

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Ionicons
						name="arrow-back"
						size={24}
						color={Theme.colors.text.dark}
					/>
				</TouchableOpacity>
				<Text style={styles.title}>Notifications</Text>
				{unreadCount > 0 ? (
					<TouchableOpacity
						onPress={handleMarkAllAsRead}
						disabled={markingAllAsRead}
						style={styles.markAllButton}
					>
						{markingAllAsRead ? (
							<ActivityIndicator size="small" color={Theme.colors.primary} />
						) : (
							<Text style={styles.markAllButtonText}>Mark all as read</Text>
						)}
					</TouchableOpacity>
				) : null}
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={Theme.colors.primary} />
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={getNotificationKey}
					renderItem={renderNotification}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.4}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<View style={styles.emptyIconContainer}>
								<Ionicons
									name="notifications-off-outline"
									size={44}
									color={Theme.colors.primary}
								/>
							</View>
							<Text style={styles.emptyTitle}>No notifications yet</Text>
							<Text style={styles.emptySubtext}>
								Updates about shipments, trips, and account activity will appear
								here.
							</Text>
						</View>
					}
					ListFooterComponent={
						loadingMore ? (
							<ActivityIndicator
								size="small"
								color={Theme.colors.primary}
								style={styles.footerLoader}
							/>
						) : null
					}
				/>
			)}

			<Modal
				visible={!!selectedNotification}
				transparent
				animationType="fade"
				onRequestClose={closeDetails}
			>
				<Pressable style={styles.modalOverlay} onPress={closeDetails}>
					<Pressable style={styles.detailCard} onPress={() => {}}>
						{selectedNotification ? (
							<>
								<View style={styles.detailHeader}>
									<View style={styles.detailIconContainer}>
										<Ionicons
											name="notifications"
											size={22}
											color={Theme.colors.primary}
										/>
									</View>
									<TouchableOpacity onPress={closeDetails}>
										<Ionicons
											name="close"
											size={22}
											color={Theme.colors.text.gray}
										/>
									</TouchableOpacity>
								</View>
								<Text style={styles.detailTitle}>
									{getNotificationTitle(selectedNotification)}
								</Text>
								<View style={styles.detailMetaRow}>
									{selectedType ? (
										<View style={styles.typeTag}>
											<Text style={styles.typeTagText}>
												{formatNotificationType(selectedType)}
											</Text>
										</View>
									) : null}
									{selectedTime ? (
										<Text style={styles.detailTime}>{selectedTime}</Text>
									) : null}
								</View>
								<ScrollView
									style={styles.detailBody}
									showsVerticalScrollIndicator={false}
								>
									<Text style={styles.detailMessage}>
										{getNotificationMessage(selectedNotification)}
									</Text>
								</ScrollView>
								{hasNavigableTarget(selectedNotification) ? (
									<CustomButton
										title="View related item"
										variant="secondary"
										onPress={handleViewRelatedItem}
										style={styles.detailButton}
									/>
								) : null}
							</>
						) : null}
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.background.secondary,
		paddingHorizontal: Theme.screenPadding.horizontal,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: Theme.spacing.xxxxl,
		marginTop: Theme.spacing.lg,
		marginBottom: Theme.spacing.xl,
	},
	backButton: {
		marginRight: Theme.spacing.md,
	},
	title: {
		flex: 1,
		fontSize: 28,
		fontFamily: "Inter-Bold",
		color: Theme.colors.text.dark,
	},
	markAllButton: {
		paddingVertical: Theme.spacing.xs,
		paddingHorizontal: Theme.spacing.sm,
	},
	markAllButtonText: {
		fontSize: 13,
		fontFamily: "Inter-SemiBold",
		color: Theme.colors.primary,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContent: {
		paddingBottom: 100,
	},
	notificationCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: Theme.colors.white,
		borderRadius: Theme.borderRadius.md,
		padding: Theme.spacing.md,
		marginBottom: Theme.spacing.sm,
		shadowColor: Theme.colors.black,
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	iconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: Theme.colors.background.border,
		justifyContent: "center",
		alignItems: "center",
		marginRight: Theme.spacing.md,
	},
	notificationContent: {
		flex: 1,
	},
	notificationHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Theme.spacing.xs,
		gap: Theme.spacing.sm,
	},
	notificationTitle: {
		flex: 1,
		fontSize: 16,
		fontFamily: "Inter-Bold",
		color: Theme.colors.text.dark,
	},
	notificationTime: {
		fontSize: 12,
		fontFamily: "Inter-Regular",
		color: Theme.colors.text.lightGray,
	},
	typeTag: {
		alignSelf: "flex-start",
		backgroundColor: Theme.colors.background.border,
		borderRadius: Theme.borderRadius.xl,
		paddingHorizontal: Theme.spacing.sm,
		paddingVertical: Theme.spacing.xs,
		marginBottom: Theme.spacing.sm,
	},
	typeTagText: {
		fontSize: 12,
		fontFamily: "Inter-SemiBold",
		color: Theme.colors.primary,
	},
	notificationMessage: {
		fontSize: 14,
		fontFamily: "Inter-Regular",
		color: Theme.colors.text.gray,
		lineHeight: 20,
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: Theme.colors.yellow,
		marginLeft: Theme.spacing.sm,
		marginTop: Theme.spacing.xs,
	},
	emptyState: {
		alignItems: "center",
		paddingHorizontal: Theme.spacing.xl,
		paddingTop: Theme.spacing.xl,
	},
	emptyIconContainer: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: Theme.colors.background.border,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
	},
	emptyTitle: {
		fontSize: 18,
		fontFamily: "Inter-Bold",
		color: Theme.colors.text.dark,
		marginBottom: Theme.spacing.sm,
	},
	emptySubtext: {
		fontSize: 14,
		fontFamily: "Inter-Regular",
		color: Theme.colors.text.gray,
		textAlign: "center",
		lineHeight: 22,
	},
	footerLoader: {
		marginVertical: Theme.spacing.md,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: Theme.screenPadding.horizontal,
	},
	detailCard: {
		width: "100%",
		maxHeight: "70%",
		backgroundColor: Theme.colors.white,
		borderRadius: Theme.borderRadius.md,
		padding: Theme.spacing.lg,
		shadowColor: Theme.colors.black,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 8,
	},
	detailHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Theme.spacing.md,
	},
	detailIconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: Theme.colors.background.border,
		justifyContent: "center",
		alignItems: "center",
	},
	detailTitle: {
		fontSize: 18,
		fontFamily: "Inter-Bold",
		color: Theme.colors.text.dark,
		marginBottom: Theme.spacing.sm,
	},
	detailMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Theme.spacing.sm,
		marginBottom: Theme.spacing.md,
	},
	detailTime: {
		fontSize: 12,
		fontFamily: "Inter-Regular",
		color: Theme.colors.text.lightGray,
	},
	detailBody: {
		marginBottom: Theme.spacing.sm,
	},
	detailMessage: {
		fontSize: 15,
		fontFamily: "Inter-Regular",
		color: Theme.colors.text.gray,
		lineHeight: 22,
	},
	detailButton: {
		marginTop: Theme.spacing.sm,
		marginBottom: 0,
	},
});

export default NotificationsScreen;
