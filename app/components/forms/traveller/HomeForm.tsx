import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "../../ui/CustomButton";
import { router } from "expo-router";

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
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Ionicons style={styles.personIcon} name="person-outline" size={24} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: isTravelerActive ? Theme.colors.green : Theme.colors.primary },
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
                { backgroundColor: isTravelerActive ? Theme.colors.yellow : Theme.colors.white },
              ]}
            />
            <Text style={styles.toggleText}>
              {isTravelerActive ? "Traveler Mode Activated" : "Activate Traveler Mode"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.shipmentHeader}>
          <Text style={styles.shipmentTitle}>My Shipments</Text>
          <TouchableOpacity onPress={() => onNavigateToShipments("Shipments")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {shipments.length > 0 ? (
          <FlatList
            data={shipments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.shipmentCard}>
                <Ionicons name="cube-outline" size={25} color={Theme.colors.yellow} />
                <View style={{ marginLeft: 10, marginRight: 20, flex: 1 }}>
                  <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
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
        title='Start Trip'
        style={styles.startTripButton}
        onPress={() => router.push('/(traveller)/packageUpload')}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToShipments("Matched Request")}>
          <Ionicons name="briefcase-outline" size={22} color={Theme.colors.text.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={22} color={Theme.colors.text.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color={Theme.colors.text.gray} />
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
  topSection: {},
  headerCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xxxxl,
    padding: Theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 120,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.md,
  },
  welcomeText: {
    color: Theme.colors.white,
    fontSize: 14,
  },
  userName: {
    color: Theme.colors.white,
    ...Theme.typography.h2,
  },
  toggleButton: {
    marginVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
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
    fontWeight: "500",
    color: Theme.colors.white,
  },
  personIcon: {
    color: Theme.colors.white,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
  },
  shipmentTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.dark,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inTransit: {
    backgroundColor: Theme.colors.lightPurple,
  },
  delivered: {
    backgroundColor: Theme.colors.lightGreen,
  },
  inTransitText: {
    color: Theme.colors.white,
    fontWeight: "400",
  },
  deliveredText: {
    color: "#155724",
    fontWeight: "400",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  seeAll: {
    color: Theme.colors.text.dark,
    fontSize: 14,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.black,
    marginBottom: Theme.spacing.xs,
  },
  shipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shipmentName: {
    fontWeight: "600",
    color: Theme.colors.text.dark,
  },
  shipmentItem: {
    fontSize: 13,
    color: Theme.colors.text.gray,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.md,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 10,
    marginTop: "auto",
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
    marginBottom: Theme.spacing.xl,
  }
});

export default HomeForm;
