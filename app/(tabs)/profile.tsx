import Theme from "@/app/constants/Theme";
import { AuthContext } from "@/app/context/AuthContext";
import { useRole } from "@/app/context/RoleContext";
import { UserProfile, userService } from "@/app/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  const { clearRole } = useRole();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  const userName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : "User";

  const menuItems = [
     { icon: "swap-horizontal-outline", label: "Switch Barukh Mode", route: "/(profile)/switchProfile" },
{ icon: "shield-checkmark-outline", label: "Verification", route: null },
    { icon: "card-outline", label: "My Payments", route: null },
    { icon: "cube-outline", label: "My Shipments", route: null },
   
    { icon: "help-circle-outline", label: "Help & Support", route: null },
    { icon: "settings-outline", label: "Settings", route: null },
  ];

  const handleMenuPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
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
          source={require("@/assets/images/avatar.png")}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => router.push("/(profile)/editProfile" as any)}
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
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={Theme.colors.primary}
              />
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
