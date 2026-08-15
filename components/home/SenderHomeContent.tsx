import { PackagePattern } from "@/assets/svgs";
import ShipmentCard, { getShipmentDetailsRoute } from "@/components/shipments/ShipmentCard";
import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { useShipments } from "@/hooks/useShipments";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { senderService } from "@/services/senderService";
import { UserProfile, userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}


const SenderHomeContent = () => {
  const router = useRouter();
  const { userId, accessToken } = useContext(AuthContext);
  const { unreadNotificationsCount } = useUnreadNotificationsCount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { shipments, loading: shipmentsLoading, refresh: refreshShipments } = useShipments();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !accessToken) return;
      const { data, ok } = await userService.getUser(userId, accessToken);
      if (ok && data) {
        setUserProfile(data);
      }
    };
    fetchUser();
  }, [userId, accessToken]);

  const userName = userProfile?.firstName || "User";
  const notificationBadgeLabel =
    unreadNotificationsCount > 99 ? "99+" : String(unreadNotificationsCount);

  const goToAllShipments = () => {
    router.push("/allShipments");
  };

  const goToNotifications = () => {
    router.push({
      pathname: "/(profile)/notifications",
    });
  };

  const [isSending, setIsSending] = useState(false);
  const [senderId, setSenderId] = useState<string | null>(null);

  const handleSendPackage = async () => {
    if (!userId || !accessToken) {
      Toast.error("You must be logged in to send a package.");
      return;
    }

    if (!userProfile) {
      Toast.error("Your profile is still loading. Please try again.");
      return;
    }

    if (!userProfile.isActive) {
      router.push("/(KYC)/KYCLanding");
      return;
    }

    if (senderId) {
      router.push({
        pathname: "/(sender)/createShipment",
        params: { senderId },
      });
      return;
    }

    try {
      setIsSending(true);
      const result = await senderService.createSender(
        {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        },
        accessToken,
      );

      let resolvedSenderId = result.data?.senderId;

      if (!result.ok || !resolvedSenderId) {
        const getResult = await senderService.getSender(userId, accessToken);

        if (!getResult.ok || !getResult.data?.senderId) {
          Toast.error(getResult.error || "Unable to retrieve your sender profile. Please try again.");
          return;
        }

        resolvedSenderId = getResult.data.senderId;
      }

      setSenderId(resolvedSenderId);

      router.push({
        pathname: "/(sender)/createShipment",
        params: { senderId: resolvedSenderId },
      });
    } catch {
      Toast.error("Unable to create your sender profile. Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const listHeader = (
    <>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.patternOverlay}>
          <PackagePattern />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.userRow}>
            <Image
              source={
                userProfile?.profilePicture
                  ? { uri: userProfile.profilePicture }
                  : require("@/assets/images/avatar.png")
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>Welcome Back !</Text>
              <Text style={styles.userName}>Hi {userName}</Text>
            </View>
            <TouchableOpacity onPress={goToNotifications} style={styles.bellIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Theme.colors.white}
              />
              {unreadNotificationsCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationBadgeLabel}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>

          <Text style={styles.myShipmentsTitle}>My Shipments</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search shipments"
              placeholderTextColor="#FFFFFF80"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.actionButton, styles.sendPackageButton, isSending && styles.disabledButton]}
          onPress={handleSendPackage}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#163330" style={{ marginRight: Theme.spacing.sm }} />
          ) : (
            <View style={styles.actionIconContainer}>
              <Ionicons name="add" size={24} />
            </View>
          )}
          <Text style={styles.actionButtonText}>
            {isSending ? "Setting up..." : "Send Package"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shipments Section Header */}
      <View style={styles.shipmentHeader}>
        <Text style={styles.shipmentTitle}>My Shipments</Text>
        <TouchableOpacity onPress={goToAllShipments}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.content}>
      <FlatList
        onRefresh={refreshShipments}
        refreshing={shipmentsLoading}
        data={shipments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          shipmentsLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="briefcase-outline" size={48} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No shipments yet</Text>
              <Text style={styles.emptySubtext}>
                You haven&apos;t sent any packages. Tap the button above to get started.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ShipmentCard
            shipment={item}
            isTraveller={false}
            onPress={() => router.push(getShipmentDetailsRoute(item, false))}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xxxxl,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    overflow: "hidden",
    position: "relative",
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    right: -20,
    width: 220,
    height: 260,
  },
  headerContent: {
    zIndex: 1,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Theme.spacing.md,
    backgroundColor: Theme.colors.secondary,
  },
  bellIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    padding: Theme.spacing.sm,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
    includeFontPadding: false,
  },
  welcomeText: {
    color: "#CED1D8",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  userName: {
    color: Theme.colors.white,
    fontSize: 21,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    letterSpacing: -1,
  },
  myShipmentsTitle: {
    color: Theme.colors.white,
    fontSize: 30,
    fontFamily: "Inter-Bold",
    lineHeight: 36,
    letterSpacing: -2,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#282828",
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.white,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  qrButton: {
    padding: Theme.spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
  },
  sendPackageButton: {
    backgroundColor: "#C7F530",
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.sm,
  },
  actionButtonText: {
    color: "#163330",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  shipmentTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  seeAll: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.xl,
    fontSize: 14,
    fontFamily: "Inter-Regular",
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
    backgroundColor: "#EBF2F1",
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
    marginBottom: Theme.spacing.lg,
  },
  emptyButton: {
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
    color: Theme.colors.primary,
  },
});

export default SenderHomeContent;
