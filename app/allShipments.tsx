import ShipmentCard, { getShipmentDetailsRoute } from "@/components/shipments/ShipmentCard";
import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { useShipments } from "@/hooks/useShipments";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
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
  const { userId, accessToken } = useContext(AuthContext);
  const { shipments, loading, error, isTraveller, refresh } = useShipments();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !accessToken) return;
      const { data, ok } = await userService.getUser(userId, accessToken);
      if (ok && data) {
        setIsActive(data.isActive);
      }
    };
    fetchUser();
  }, [userId, accessToken]);

  const handleCreatePress = () => {
    if (!isActive) {
      router.push("/(KYC)/KYCLanding");
      return;
    }

    if (isTraveller) {
      router.push("/(traveller)/packageDetails");
    } else {
      router.push({ pathname: "/(sender)/createShipment", params: { senderId: "" } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>
          My <Text style={styles.titleHighlight}>Shipments</Text>
        </Text>
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
              <Text style={styles.emptyTitle}>No shipments yet</Text>
              <Text style={styles.emptySubtext}>
                {error ||
                  (isTraveller
                    ? "You haven't been matched with a shipment yet. "
                    : "You haven't sent any packages yet. ")}
                {!error ? (
                  <>
                    But you can create a new {isTraveller ? "trip" : "package"}{" "}
                    <Text style={styles.emptyLink} onPress={handleCreatePress}>
                      here
                    </Text>
                    .
                  </>
                ) : null}
              </Text>
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
    paddingHorizontal: Theme.screenPadding.horizontal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Theme.spacing.xxxxl,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    marginRight: Theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  titleHighlight: {
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyStateContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Theme.colors.background.border,
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
  },
  emptyLink: {
    color: Theme.colors.secondary,
    fontFamily: "Inter-SemiBold",
  },
});
