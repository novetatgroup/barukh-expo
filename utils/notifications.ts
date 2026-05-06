import type { PushNotification } from "@/services/notificationService";

export const getNotificationPayload = (notification: PushNotification) =>
  notification.notification || notification;

export const isUnreadNotification = (notification: PushNotification) => {
  const payload = getNotificationPayload(notification);

  return (
    payload.isRead === false ||
    payload.read === false ||
    (!payload.isRead && !payload.read && !payload.readAt)
  );
};
