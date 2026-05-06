import { AuthContext } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { isUnreadNotification } from "@/utils/notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";

const NOTIFICATIONS_BADGE_LIMIT = 100;

export const useUnreadNotificationsCount = () => {
  const { accessToken } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }

    const { data, ok } = await notificationService.getMyNotifications(
      1,
      NOTIFICATIONS_BADGE_LIMIT,
      accessToken
    );

    if (!ok || !data) return;

    setUnreadCount(data.data.filter(isUnreadNotification).length);
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadNotificationsCount();
    }, [refreshUnreadNotificationsCount])
  );

  return {
    unreadNotificationsCount: unreadCount,
    refreshUnreadNotificationsCount,
  };
};
