import Theme from "@/app/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Shipment, UserShipment } from "../../../types/shipments";

type MyShipmentsFormProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  shipments: Shipment[];
  onCardPress: (shipment: Shipment) => void;
};

const MyShipmentsForm: React.FC<MyShipmentsFormProps> = ({
  activeTab,
  onTabChange,
  shipments,
}) => {
  const tabs = ["All", "Accepted", "Rejected", "Cancelled"];

  const filteredShipments = shipments.filter((shipment) => {
    if (!("name" in shipment)) return false;

    if (activeTab === "All") {
      return (
        shipment.status === "Accepted" ||
        shipment.status === "Rejected" ||
        shipment.status === "Cancelled"
      );
    }

    return shipment.status === activeTab;
  });

  const handleCardPress = (shipment: Shipment) => {
    if ("name" in shipment) {
      router.push({
        pathname: "/(traveller)/matchDetails",
        params: {
          matchedUserName: (shipment as UserShipment).name,
          matchedUserImage: (shipment as UserShipment).avatar,
          itemName: (shipment as UserShipment).item,
          category: "Personal Electronics",
          fromLocation: "Ontario, Canada",
          toLocation: "Kampala, Uganda",
        },
      });
    }
  };

  const renderUserShipment = ({ item }: { item: UserShipment }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
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
  );

  const renderShipment = ({ item }: { item: Shipment }) => {
    return renderUserShipment({ item: item as UserShipment });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My <Text style={styles.highlight}>Shipments</Text>
      </Text>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => onTabChange(tab)}
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
        <FlatList<Shipment>
          data={filteredShipments}
          keyExtractor={(item) => item.id}
          renderItem={renderShipment}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>
          No shipments found in this category.
        </Text>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(traveller)/home")}
        >
          <Ionicons name="home" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(traveller)/travellerDetails")}
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
    paddingTop: Theme.spacing.xxxl,
    paddingHorizontal: Theme.screenPadding.horizontal / 1.5,
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
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.text.dark,
  },
  emptyText: {
    textAlign: "center",
    color: Theme.colors.text.gray,
    marginTop: Theme.spacing.xxl,
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
});

export default MyShipmentsForm;
