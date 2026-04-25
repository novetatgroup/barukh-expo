import { Theme } from "@/constants/Theme";
import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { senderService, ShipmentDetails } from "@/services/senderService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

type SenderTravellerMatch = {
  kind: "senderTravellerMatch";
  id: string;
  travellerName: string;
  parcelName: string;
  route: string;
  matchScore: string;
  rating: string;
  departureWindow: string;
};

type SenderTravellerRequest = {
  kind: "senderTravellerRequest";
  id: string;
  requestId: string;
  travellerName: string;
  requestedItem: string;
  proposedPickup: string;
  payoutOffer: string;
  requestStatus: "New" | "Pending";
};

type SenderShipment = {
  kind: "senderShipment";
  id: string;
  orderId: string;
  packageId: string;
  itemId: string;
  itemName: string;
  progress: string;
  expectedDelivery: string;
  shipmentCost: string;
  insuranceFee: string;
  serviceFee: string;
  fromLocation: string;
  toLocation: string;
};

type TravellerMatchRequest = {
  kind: "travellerMatchRequest";
  id: string;
  senderName: string;
  packageName: string;
  pickupCity: string;
  destinationCity: string;
  reward: string;
  weightKg: string;
};

type TravellerAccepted = {
  kind: "travellerAccepted";
  id: string;
  acceptanceCode: string;
  senderName: string;
  packageName: string;
  handoffDate: string;
  pickupPoint: string;
  status: "Accepted" | "Ready";
};

type TravellerShipment = {
  kind: "travellerShipment";
  id: string;
  orderId: string;
  itemId: string;
  itemName: string;
  recipientCity: string;
  progress: "Delivered" | "In Transit";
  expectedDelivery: string;
  shipmentCost: string;
  insuranceFee: string;
  serviceFee: string;
};

type CategoryListItem =
  | SenderTravellerMatch
  | SenderTravellerRequest
  | SenderShipment
  | TravellerMatchRequest
  | TravellerAccepted
  | TravellerShipment;

type CardModel = {
  icon: IconName;
  iconBackground: string;
  title: string;
  subtitle: string;
  detail: string;
  meta: string;
  showStars?: boolean;
};

const senderTravellerMatches: SenderTravellerMatch[] = [
  {
    kind: "senderTravellerMatch",
    id: "1",
    travellerName: "Miles Zawedde",
    parcelName: "MacBook Pro",
    route: "Toronto - Kampala",
    matchScore: "96%",
    rating: "5.0",
    departureWindow: "Jul 21, 9:00 AM",
  },
  {
    kind: "senderTravellerMatch",
    id: "2",
    travellerName: "Amina Clarke",
    parcelName: "Camera Lens",
    route: "London - Entebbe",
    matchScore: "91%",
    rating: "4.8",
    departureWindow: "Jul 24, 2:30 PM",
  },
];

const senderTravellerRequests: SenderTravellerRequest[] = [
  {
    kind: "senderTravellerRequest",
    id: "3",
    requestId: "TR-2041",
    travellerName: "Noah Kim",
    requestedItem: "JBL Speaker",
    proposedPickup: "Mississauga Hub",
    payoutOffer: "$18.00",
    requestStatus: "New",
  },
  {
    kind: "senderTravellerRequest",
    id: "4",
    requestId: "TR-2042",
    travellerName: "Sarah Mensah",
    requestedItem: "iPhone 15",
    proposedPickup: "Heathrow T3",
    payoutOffer: "$24.00",
    requestStatus: "Pending",
  },
];

const travellerMatchRequests: TravellerMatchRequest[] = [
  {
    kind: "travellerMatchRequest",
    id: "7",
    senderName: "John Doe",
    packageName: "MacBook Pro",
    pickupCity: "Ontario",
    destinationCity: "Kampala",
    reward: "$28.00",
    weightKg: "2.1 kg",
  },
  {
    kind: "travellerMatchRequest",
    id: "8",
    senderName: "Alice Brown",
    packageName: "Camera Lens",
    pickupCity: "London",
    destinationCity: "Entebbe",
    reward: "$19.00",
    weightKg: "0.8 kg",
  },
];

const travellerAccepted: TravellerAccepted[] = [
  {
    kind: "travellerAccepted",
    id: "9",
    acceptanceCode: "AC-1180",
    senderName: "Jane Smith",
    packageName: "iPhone 15",
    handoffDate: "Jul 22",
    pickupPoint: "Pearson Airport",
    status: "Accepted",
  },
  {
    kind: "travellerAccepted",
    id: "10",
    acceptanceCode: "AC-1181",
    senderName: "Bob Wilson",
    packageName: "JBL Speaker",
    handoffDate: "Jul 25",
    pickupPoint: "Downtown Toronto",
    status: "Ready",
  },
];

const travellerShipments: TravellerShipment[] = [
  {
    kind: "travellerShipment",
    id: "11",
    orderId: "#01-TV9012",
    itemId: "#TV9012",
    itemName: "Documents",
    recipientCity: "Kampala",
    progress: "In Transit",
    expectedDelivery: "Jul 29",
    shipmentCost: "$9.00",
    insuranceFee: "$1.80",
    serviceFee: "$1.20",
  },
  {
    kind: "travellerShipment",
    id: "12",
    orderId: "#01-TV9013",
    itemId: "#TV9013",
    itemName: "Smart Watch",
    recipientCity: "Entebbe",
    progress: "Delivered",
    expectedDelivery: "Aug 01",
    shipmentCost: "$13.00",
    insuranceFee: "$2.70",
    serviceFee: "$1.60",
  },
];

const senderTabs = ["Traveller Matches", "Traveller Requests", "Shipments"] as const;
const travellerTabs = ["Matches Requests", "Accepted", "Shipments"] as const;

const getCategoryItems = (
  isTraveller: boolean,
  activeTab: string,
  senderShipments: SenderShipment[]
): CategoryListItem[] => {
  if (isTraveller) {
    switch (activeTab) {
      case "Matches Requests":
        return travellerMatchRequests;
      case "Accepted":
        return travellerAccepted;
      case "Shipments":
      default:
        return travellerShipments;
    }
  }

  switch (activeTab) {
    case "Traveller Requests":
      return senderTravellerRequests;
    case "Shipments":
      return senderShipments;
    case "Traveller Matches":
    default:
      return senderTravellerMatches;
  }
};

const getCardModel = (item: CategoryListItem): CardModel => {
  switch (item.kind) {
    case "senderTravellerMatch":
      return {
        icon: "person",
        iconBackground: "#F5D6A8",
        title: item.travellerName,
        subtitle: item.parcelName,
        detail: item.route,
        meta: item.rating,
        showStars: true,
      };
    case "senderTravellerRequest":
      return {
        icon: "mail-unread-outline",
        iconBackground: "#EBF2F1",
        title: item.travellerName,
        subtitle: item.requestedItem,
        detail: item.proposedPickup,
        meta: item.requestStatus,
      };
    case "senderShipment":
      return {
        icon: "cube-outline",
        iconBackground: Theme.colors.yellow,
        title: item.packageId,
        subtitle: item.itemName,
        detail: `${item.fromLocation} - ${item.toLocation}`,
        meta: item.progress,
      };
    case "travellerMatchRequest":
      return {
        icon: "cube-outline",
        iconBackground: "#EBF2F1",
        title: item.senderName,
        subtitle: item.packageName,
        detail: `${item.pickupCity} - ${item.destinationCity}`,
        meta: item.reward,
      };
    case "travellerAccepted":
      return {
        icon: "checkmark-circle-outline",
        iconBackground: Theme.colors.yellow,
        title: item.senderName,
        subtitle: item.packageName,
        detail: item.pickupPoint,
        meta: item.status,
      };
    case "travellerShipment":
      return {
        icon: "airplane-outline",
        iconBackground: "#EBF2F1",
        title: item.orderId,
        subtitle: item.itemName,
        detail: `To ${item.recipientCity}`,
        meta: item.progress,
      };
  }
};

const formatShipmentStatus = (status: string) =>
  status
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value?: string) => {
  if (!value) return "Pending";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

const formatMoney = (priceMinor: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(priceMinor / 100);
  } catch {
    return `${currency} ${(priceMinor / 100).toFixed(2)}`;
  }
};

const mapSenderShipment = (shipment: ShipmentDetails): SenderShipment => ({
  kind: "senderShipment",
  id: shipment.id,
  orderId: `#${shipment.id.slice(0, 8).toUpperCase()}`,
  itemId: `#${shipment.packageId.slice(0, 8).toUpperCase()}`,
  packageId: `#${shipment.packageId.slice(0, 8).toUpperCase()}`,
  itemName: shipment.package.name,
  progress: formatShipmentStatus(shipment.status),
  expectedDelivery: formatDate(shipment.travel.arrivalAt),
  shipmentCost: formatMoney(shipment.priceMinor, shipment.currency),
  insuranceFee: "$0.00",
  serviceFee: "$0.00",
  fromLocation: shipment.package.originCity || shipment.travel.originCity,
  toLocation: shipment.package.destinationCity || shipment.travel.destinationCity,
});

const ShipmentsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; senderId?: string }>();
  const { role, loading } = useRole();
  const {
    accessToken,
    userId,
    loading: authLoading,
  } = useContext(AuthContext);

  const isTraveller = role === "TRAVELLER";
  const tabs: readonly string[] = isTraveller ? travellerTabs : senderTabs;
  const [activeTab, setActiveTab] = useState(params.tab || tabs[0]);
  const [senderShipmentItems, setSenderShipmentItems] = useState<SenderShipment[]>([]);
  const [senderShipmentsLoading, setSenderShipmentsLoading] = useState(false);
  const [senderShipmentsError, setSenderShipmentsError] = useState<string | null>(null);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(params.tab && tabs.includes(params.tab) ? params.tab : tabs[0]);
    }
  }, [activeTab, params.tab, tabs]);

  const fetchSenderShipments = useCallback(async () => {
    if (isTraveller || !accessToken || !userId) {
      setSenderShipmentItems([]);
      setSenderShipmentsLoading(false);
      return;
    }

    setSenderShipmentsLoading(true);
    setSenderShipmentsError(null);

    try {
      let resolvedSenderId = params.senderId;

      if (!resolvedSenderId) {
        const senderResult = await senderService.getSender(userId, accessToken);

        if (!senderResult.ok || !senderResult.data?.senderId) {
          setSenderShipmentItems([]);
          setSenderShipmentsError(
            senderResult.error || "Unable to load sender profile."
          );
          return;
        }

        resolvedSenderId = senderResult.data.senderId;
      }

      const shipmentsResult = await senderService.getSenderShipments(
        resolvedSenderId,
        accessToken
      );

      if (!shipmentsResult.ok || !shipmentsResult.data) {
        setSenderShipmentItems([]);
        setSenderShipmentsError(
          shipmentsResult.error || "Unable to load shipments."
        );
        return;
      }

      setSenderShipmentItems(shipmentsResult.data.data.map(mapSenderShipment));
    } catch (error) {
      console.error("Sender shipments error:", error);
      setSenderShipmentItems([]);
      setSenderShipmentsError("Unable to load shipments.");
    } finally {
      setSenderShipmentsLoading(false);
    }
  }, [accessToken, isTraveller, params.senderId, userId]);

  useEffect(() => {
    if (!authLoading && !isTraveller && activeTab === "Shipments") {
      fetchSenderShipments();
    }
  }, [activeTab, authLoading, fetchSenderShipments, isTraveller]);

  const activeItems = getCategoryItems(
    isTraveller,
    activeTab,
    senderShipmentItems
  );
  const showSenderShipmentsState = !isTraveller && activeTab === "Shipments";

  const handleCardPress = (item: CategoryListItem) => {
    switch (item.kind) {
      case "senderTravellerMatch":
        router.push({
          pathname: "/(sender)/travellerMatchCategoryDetails",
          params: {
            travellerName: item.travellerName,
            parcelName: item.parcelName,
            route: item.route,
            matchScore: item.matchScore,
            rating: item.rating,
            departureWindow: item.departureWindow,
          },
        });
        break;
      case "senderTravellerRequest":
        router.push({
          pathname: "/(sender)/travellerRequestDetails",
          params: {
            requestId: item.requestId,
            travellerName: item.travellerName,
            requestedItem: item.requestedItem,
            proposedPickup: item.proposedPickup,
            payoutOffer: item.payoutOffer,
            requestStatus: item.requestStatus,
          },
        });
        break;
      case "senderShipment":
        router.push({
          pathname: "/(sender)/shipmentDetails",
          params: {
            orderId: item.orderId,
            itemId: item.itemId,
            itemName: item.itemName,
            progress: item.progress,
            expectedDelivery: item.expectedDelivery,
            shipmentCost: item.shipmentCost,
            insuranceFee: item.insuranceFee,
            serviceFee: item.serviceFee,
            fromLocation: item.fromLocation,
            toLocation: item.toLocation,
          },
        });
        break;
      case "travellerMatchRequest":
        router.push({
          pathname: "/(traveller)/matchRequestDetails",
          params: {
            senderName: item.senderName,
            packageName: item.packageName,
            pickupCity: item.pickupCity,
            destinationCity: item.destinationCity,
            reward: item.reward,
            weightKg: item.weightKg,
          },
        });
        break;
      case "travellerAccepted":
        router.push({
          pathname: "/(traveller)/acceptedShipmentDetails",
          params: {
            acceptanceCode: item.acceptanceCode,
            senderName: item.senderName,
            packageName: item.packageName,
            handoffDate: item.handoffDate,
            pickupPoint: item.pickupPoint,
            status: item.status,
          },
        });
        break;
      case "travellerShipment":
        router.push({
          pathname: "/(traveller)/shipmentDetails",
          params: {
            orderId: item.orderId,
            itemId: item.itemId,
            itemName: item.itemName,
            progress: item.progress,
            expectedDelivery: item.expectedDelivery,
            shipmentCost: item.shipmentCost,
            insuranceFee: item.insuranceFee,
            serviceFee: item.serviceFee,
          },
        });
        break;
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My <Text style={styles.highlight}>Shipments</Text>
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
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
      </ScrollView>

      {showSenderShipmentsState &&
      senderShipmentsLoading &&
      activeItems.length === 0 ? (
        <View style={styles.listLoader}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        </View>
      ) : activeItems.length > 0 ? (
        <FlatList<CategoryListItem>
          data={activeItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={showSenderShipmentsState && senderShipmentsLoading}
          onRefresh={
            showSenderShipmentsState ? fetchSenderShipments : undefined
          }
          renderItem={({ item }) => {
            const card = getCardModel(item);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleCardPress(item)}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    { backgroundColor: card.iconBackground },
                  ]}
                >
                  <Ionicons
                    name={card.icon}
                    size={22}
                    color={Theme.colors.primary}
                  />
                </View>

                <View style={styles.cardText}>
                  <Text style={styles.name}>{card.title}</Text>
                  <Text style={styles.item}>{card.subtitle}</Text>
                  <Text style={styles.detail}>{card.detail}</Text>
                </View>

                <View style={styles.metaContainer}>
                  {card.showStars && (
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={10}
                          color="#FFD700"
                          style={styles.starIcon}
                        />
                      ))}
                    </View>
                  )}
                  <Text style={styles.metaText}>{card.meta}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <Text style={styles.emptyText}>
          {senderShipmentsError || "No shipments found in this category."}
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
    alignItems: "center",
    gap: 5,
    paddingRight: Theme.spacing.md,
  },
  tabScrollView: {
    flexGrow: 0,
    marginBottom: Theme.spacing.md,
  },
  tab: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: Theme.colors.yellow,
  },
  tabText: {
    color: Theme.colors.text.gray,
    fontSize: 12,
    fontFamily: "Inter-Regular",
    includeFontPadding: false,
  },
  activeTabText: {
    color: Theme.colors.text.dark,
    fontFamily: "Inter-SemiBold",
  },
  listContent: {
    paddingBottom: 100,
  },
  listLoader: {
    paddingTop: Theme.spacing.xxl,
    alignItems: "center",
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
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
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
    marginBottom: 2,
  },
  detail: {
    color: Theme.colors.text.lightGray,
    fontSize: 11,
    fontFamily: "Inter-Regular",
  },
  metaContainer: {
    alignItems: "flex-end",
    maxWidth: 86,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  starIcon: {
    marginLeft: 1,
  },
  metaText: {
    color: Theme.colors.text.dark,
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    textAlign: "right",
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
