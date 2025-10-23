import Theme from "@/app/constants/Theme";
import { Logo } from "@/assets/svgs/index";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showTabSwitcher?: boolean;
  activeTab?: "login" | "register";
  onTabChange?: (tab: "login" | "register") => void;
}

const gridImage = require("../../../../assets/images/grid.png");

const { width: screenWidth } = Dimensions.get("window");

const AuthScreenLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  showTabSwitcher = false,
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>

      <Logo style={styles.logo} />

      {/* <Image
        source={require("../../../../assets/images/grid.png")}
        style={styles.grid}
      /> */}
      <Image
        source={gridImage}
        style={styles.grid}
        fadeDuration={0}
        resizeMode="cover"
      />
      {/* <GridBackground width={200} height={300} /> */}

      <Text  style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>


      <View style={styles.formContainer}>

        {showTabSwitcher && activeTab && onTabChange && (
          <View style={styles.tabContainer}>
            <View
              style={[
                styles.tab,
                activeTab === "login" && styles.activeTab,
              ]}
              onTouchEnd={() => onTabChange("login")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "login" && styles.activeTabText,
                ]}
              >
                Login
              </Text>
            </View>

            <View
              style={[
                styles.tab,
                activeTab === "register" && styles.activeTab,
              ]}
              onTouchEnd={() => onTabChange("register")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "register" && styles.activeTabText,
                ]}
              >
                Register
              </Text>
            </View>
          </View>
        )}

        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
  },
  logo: {
    width: 45,
    height: 45,
    marginLeft: Theme.screenPadding.horizontal,
    marginTop: Theme.spacing.xxxxxxxl,
    //marginTop: 120
  },
  grid: {
    width: 350,
    height: 350,
    position: "absolute",
    top: 0,
    left: screenWidth - 240 - 10,
  },
  title: {
    ...Theme.typography.h1,
    fontFamily: 'Inter-Regular',
    textAlign: "left",
    marginLeft: Theme.screenPadding.horizontal,
    color: Theme.colors.text.light,
    fontSize: 32,
    marginTop: 10,
  },
  subtitle: {
    ...Theme.typography.caption,
    fontFamily: 'Inter-Regular',
    marginLeft: Theme.screenPadding.horizontal,
    textAlign: "left",
    fontSize: 14,
    marginTop: 6,
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.text.light,
  },
  formContainer: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.screenPadding.horizontal,
    flex: 1,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
    marginBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: Theme.colors.white,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: 'Inter-Regular',
    color: "#666",
  },
  activeTabText: {
    color: Theme.colors.black,
  },
});

export default AuthScreenLayout;