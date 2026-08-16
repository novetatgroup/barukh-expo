import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { senderService } from "@/services/senderService";
import { travellerService } from "@/services/travellerService";
import { UserProfile, userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  const { logout, userId, accessToken } = useContext(AuthContext);
  const { clearRole, role } = useRole();
  const { unreadNotificationsCount } = useUnreadNotificationsCount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [roleNumber, setRoleNumber] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchRoleNumber = async () => {
      if (!userId || !accessToken) return;

      if (role === "SENDER") {
        const { data, ok } = await senderService.getSender(userId, accessToken);
        setRoleNumber(ok && data ? data.senderNumber : null);
      } else if (role === "TRAVELLER") {
        const { data, ok } = await travellerService.getTraveller(accessToken);
        setRoleNumber(ok && data ? data.travellerNumber : null);
      } else {
        setRoleNumber(null);
      }
    };
    fetchRoleNumber();
  }, [role, userId, accessToken]);

  const userName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : "User";
  const notificationBadgeLabel =
    unreadNotificationsCount > 99 ? "99+" : String(unreadNotificationsCount);

  const switchModeLabel =
    role === "SENDER"
      ? "Switch to Barukh Go"
      : role === "TRAVELLER"
        ? "Switch to Barukh Send"
        : "Switch Barukh Mode";

  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: Href | null;
  }[] = [
    { icon: "swap-horizontal-outline", label: switchModeLabel, route: "/(profile)/switchProfile" },
    { icon: "notifications-outline", label: "Notifications", route: "/(profile)/notifications" },
    {
      icon: "shield-checkmark-outline",
      label: "Verification",
      route: userProfile?.isActive ? "/(KYC)/verifiedScreen" : "/(KYC)/KYCLanding",
    },
    ...(role === "TRAVELLER"
      ? [{ icon: "business-outline" as const, label: "Payout Accounts", route: "/(profile)/payoutAccounts" as Href }]
      : role === "SENDER"
        ? [{ icon: "card-outline" as const, label: "My Payments", route: "/(profile)/payments" as Href }]
        : []),
    { icon: "briefcase-outline", label: "My Shipments", route: "/allShipments" },

    { icon: "help-circle-outline", label: "Help & Support", route: null },
    { icon: "settings-outline", label: "Settings", route: null },
  ];

  const handleMenuPress = (route: Href | null) => {
    if (route) {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    await clearRole();
    await logout();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileHeader}>
        <Image
          source={
            userProfile?.profilePicture
              ? { uri: userProfile.profilePicture }
              : require("@/assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userName}</Text>
          {roleNumber ? <Text style={styles.userNumber}>{roleNumber}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => router.push("/(profile)/editProfile")}
        >
          <Ionicons name="create-outline" size={22} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name={item.icon}
                size={22}
                color={Theme.colors.primary}
              />
              {item.label === "Notifications" && unreadNotificationsCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationBadgeLabel}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Theme.colors.text.gray}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={Theme.colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
  },
  contentContainer: {
    paddingTop: Theme.spacing.xxxxl,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  userName: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  userNumber: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginTop: 2,
  },
  editIcon: {
    padding: Theme.spacing.xs,
  },
  menuContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.background.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
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
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
    marginLeft: Theme.spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.error,
    marginLeft: Theme.spacing.sm,
  },
});

export default ProfileScreen;
