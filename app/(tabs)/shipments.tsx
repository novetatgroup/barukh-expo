import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRole } from "@/app/context/RoleContext";
import Theme from "@/app/constants/Theme";

type ShipmentItem = {
  id: string;
  name: string;
  item: string;
  avatar?: string;
  status: "Accepted" | "Rejected" | "Cancelled";
};

const mockShipments: ShipmentItem[] = [
  {
    id: "1",
    name: "John Doe",
    item: "MacBook Pro",
    avatar: undefined,
    status: "Accepted",
  },
  {
    id: "2",
    name: "Jane Smith",
    item: "iPhone 15",
    avatar: undefined,
    status: "Accepted",
  },
  {
    id: "3",
    name: "Bob Wilson",
    item: "JBL Speaker",
    avatar: undefined,
    status: "Rejected",
  },
  {
    id: "4",
    name: "Alice Brown",
    item: "Camera Lens",
    avatar: undefined,
    status: "Cancelled",
  },
];

const ShipmentsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { role, loading } = useRole();

  const [activeTab, setActiveTab] = useState(params.tab || "All");
  const tabs = ["All", "Accepted", "Rejected", "Cancelled"];

  const isTraveller = role === "TRAVELLER";
  const title = isTraveller ? "Trips" : "Shipments";

  const filteredShipments = mockShipments.filter((shipment) => {
    if (activeTab === "All") return true;
    return shipment.status === activeTab;
  });

  const handleCardPress = (shipment: ShipmentItem) => {
    if (isTraveller) {
      router.push({
        pathname: "/(traveller)/matchDetails",
        params: {
          matchedUserName: shipment.name,
          matchedUserImage: shipment.avatar || "",
          itemName: shipment.item,
          category: "Personal Electronics",
          fromLocation: "Ontario, Canada",
          toLocation: "Kampala, Uganda",
        },
      });
    } else {
      // Sender-specific navigation
      router.push({
        pathname: "/(sender)/shipmentDetails",
        params: { shipmentId: shipment.id },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My <Text style={styles.highlight}>{title}</Text>
      </Text>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredShipments.length > 0 ? (
        <FlatList
          data={filteredShipments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleCardPress(item)}
            >
              <View style={styles.avatarContainer}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <Ionicons
                    name="person-circle"
                    size={48}
                    color={Theme.colors.primary}
                  />
                )}
              </View>
              <View style={styles.cardText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.item}>{item.item}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={14}
                      color="#FFD700"
                      style={styles.starIcon}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>
          No {title.toLowerCase()} found in this category.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Theme.spacing.xxxl,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background.secondary,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Regular",
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
    color: Theme.colors.text.dark,
  },
  highlight: {
    color: Theme.colors.text.dark,
    fontFamily: "Inter-Bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 23,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#CDFF00",
  },
  tabText: {
    color: Theme.colors.text.gray,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  activeTabText: {
    color: Theme.colors.text.dark,
    fontFamily: "Inter-SemiBold",
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
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
  avatarContainer: {
    marginRight: Theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.xl,
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: Theme.colors.text.dark,
    marginBottom: 2,
  },
  item: {
    color: Theme.colors.text.gray,
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  starIcon: {
    marginLeft: 1,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.xxl,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default ShipmentsScreen;
