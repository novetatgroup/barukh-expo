import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import Theme from "@/app/constants/Theme";

type TabName = "home" | "shipments" | "messages" | "profile";

type NavItem = {
  name: TabName;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  route: string;
};

const navItems: NavItem[] = [
  {
    name: "home",
    iconActive: "home",
    iconInactive: "home-outline",
    route: "home",
  },
  {
    name: "shipments",
    iconActive: "briefcase",
    iconInactive: "briefcase-outline",
    route: "myShipments",
  },
  {
    name: "messages",
    iconActive: "chatbubbles",
    iconInactive: "chatbubbles-outline",
    route: "messages",
  },
  {
    name: "profile",
    iconActive: "person",
    iconInactive: "person-outline",
    route: "profile",
  },
];

type BottomNavBarProps = {
  activeTab?: TabName;
};

const BottomNavBar = ({ activeTab }: BottomNavBarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): TabName => {
    if (activeTab) return activeTab;

    // Determine active tab from current route
    if (pathname.includes("myShipments") || pathname.includes("shipment")) {
      return "shipments";
    }
    if (pathname.includes("message") || pathname.includes("chat")) {
      return "messages";
    }
    if (pathname.includes("profile")) {
      return "profile";
    }
    // Default to home for home screens and unknown routes
    return "home";
  };

  const currentTab = getActiveTab();

  const handleNavPress = (item: NavItem) => {
    // Determine the route group based on current pathname
    const isSender = pathname.includes("(sender)");
    const routeGroup = isSender ? "(sender)" : "(traveller)";

    switch (item.name) {
      case "home":
        router.push(`/${routeGroup}/home`);
        break;
      case "shipments":
        router.push({
          pathname: `/${routeGroup}/myShipments`,
          params: { tab: "All" },
        });
        break;
      case "messages":
        router.push("/chat");
        break;
      case "profile":
        router.push("/profile");
        break;
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = currentTab === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavPress(item)}
          >
            <Ionicons
              name={isActive ? item.iconActive : item.iconInactive}
              size={24}
              color={isActive ? Theme.colors.primary : Theme.colors.text.gray}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 14,
    marginBottom: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: {
    padding: Theme.spacing.sm,
  },
});

export default BottomNavBar;
