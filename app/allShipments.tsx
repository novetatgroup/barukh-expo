import ShipmentCard, { getShipmentDetailsRoute } from "@/components/shipments/ShipmentCard";
import { Theme } from "@/constants/Theme";
import { useShipments } from "@/hooks/useShipments";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AllShipmentsScreen = () => {
  const router = useRouter();
  const { shipments, loading, error, isTraveller, refresh } = useShipments();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={26} color={Theme.colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shipments</Text>
        <View style={styles.headerButton} />
      </View>

      {loading && shipments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={shipments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <ShipmentCard
              shipment={item}
              isTraveller={isTraveller}
              onPress={() => router.push(getShipmentDetailsRoute(item, isTraveller))}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="briefcase-outline" size={36} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>{error || "No shipments found."}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AllShipmentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 96,
    paddingBottom: Theme.spacing.xl,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyStateContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.xxl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.background.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
