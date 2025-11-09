import Theme from "@/app/constants/Theme";
import { PackagePattern } from "@/assets/svgs";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../../ui/CustomButton";

type Shipment = {
  id: string;
  item: string;
  trackingNumber: string;
  status: string;
  progress: string;
};

type HomeFormProps = {
  userName: string;
  onActivateTravelerMode: () => void;
  onNavigateToDetails?: () => void;
  onNavigateToShipments: (tab?: string) => void;
  isTravelerActive: boolean;
  shipments: Shipment[];
};

const HomeForm: React.FC<HomeFormProps> = ({
  userName,
  onActivateTravelerMode,
  onNavigateToShipments,
  isTravelerActive,
  shipments = [],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.headerCard}>
          <View style={styles.patternOverlay}>
            <PackagePattern />
          </View>

          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Ionicons
                style={styles.personIcon}
                name="person-outline"
                size={24}
              />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome Back !</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bellIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: isTravelerActive
                ? Theme.colors.green
                : Theme.colors.primary,
            },
          ]}
          onPress={() => {
            if (!isTravelerActive) {
              router.push("/(KYC)/KYCLanding");
            } else {
              onActivateTravelerMode();
            }
          }}
        >
          <View style={styles.dotRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isTravelerActive
                    ? Theme.colors.yellow
                    : Theme.colors.white,
                },
              ]}
            />
            <Text style={styles.toggleText}>
              {isTravelerActive
                ? "Traveler Mode Activated"
                : "Activate Traveler Mode"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.shipmentHeader}>
          <Text style={styles.shipmentTitle}>My Shipments</Text>
          <TouchableOpacity onPress={() => onNavigateToShipments("All")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {shipments.length > 0 ? (
          <FlatList
            data={shipments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.shipmentCard}>
                <View style={styles.packageIconContainer}>
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color={Theme.colors.primary}
                  />
                </View>
                <View style={styles.shipmentInfo}>
                  <Text style={styles.trackingNumber}>
                    {item.trackingNumber}
                  </Text>
                  <Text style={styles.shipmentItem}>{item.item}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.progress === "Delivered"
                      ? styles.delivered
                      : styles.inTransit,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.progress === "Delivered"
                        ? styles.deliveredText
                        : styles.inTransitText,
                    ]}
                  >
                    {item.progress === "Delivered" ? "Delivered" : "In Transit"}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No shipments yet</Text>
        )}
      </View>

      <CustomButton
        title="Start Trip"
        style={styles.startTripButton}
        onPress={() => router.push("/(traveller)/packageUpload")}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigateToShipments("All")}
        >
          <Ionicons
            name="briefcase-outline"
            size={24}
            color={Theme.colors.text.gray}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={Theme.colors.text.gray}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="person-outline"
            size={24}
            color={Theme.colors.text.gray}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
  },
  topSection: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xxxxl,
    padding: Theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 120,
    overflow: "hidden",
    position: "relative",
  },
  patternOverlay: {
    position: "absolute",
    top: 10,
    right: -40,
    width: 200,
    height: 150,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  avatar: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.md,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  bellIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.sm,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
  },
  toggleButton: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 18,
    alignItems: "center",
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.white,
  },
  personIcon: {
    color: Theme.colors.white,
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
  shipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageIconContainer: {
    backgroundColor: "#C7F530",
    borderRadius: Theme.borderRadius.md,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  shipmentInfo: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  trackingNumber: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: Theme.colors.black,
    marginBottom: 2,
  },
  shipmentItem: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  inTransit: {
    backgroundColor: "#7856D3",
  },
  delivered: {
    backgroundColor: "#32BF5B",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.white,
  },
  inTransitText: {
    color: Theme.colors.white,
  },
  deliveredText: {
    color: Theme.colors.white,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.xl,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 12,
    marginBottom: Theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: {
    padding: Theme.spacing.sm,
  },
  startTripButton: {
    height: Theme.components.button.height,
    marginBottom: Theme.spacing.md,
  },
});

export default HomeForm;
