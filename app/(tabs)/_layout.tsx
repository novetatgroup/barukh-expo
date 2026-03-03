import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    home: { active: "home", inactive: "home-outline" },
    shipments: { active: "briefcase", inactive: "briefcase-outline" },
    chat: { active: "chatbubbles", inactive: "chatbubbles-outline" },
    profile: { active: "person", inactive: "person-outline" },
  };

  return (
    <View style={styles.tabBarContainer}>
      
      <View style={styles.tabBarBackground} />


      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconConfig = icons[route.name] || { active: "help", inactive: "help-outline" };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={1}
            >
              <Ionicons
                name={isFocused ? iconConfig.active : iconConfig.inactive}
                size={24}
                color={isFocused ? "#163330" : Theme.colors.text.gray}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="shipments" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: Theme.colors.background.secondary,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
    marginHorizontal: Theme.screenPadding.horizontal / 1.5,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabItem: {
    padding: Theme.spacing.sm,
  },
});
