import Theme from "@/app/constants/Theme";
import { router } from "expo-router";
import React from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	Shipment,
	UserShipment,
	TrackingShipment,
} from "../../../types/shipments";

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
	const tabs = ["Matched Request", "Accepted", "Shipments"];

	const filteredShipments = shipments.filter(
		(shipment) => shipment.status === activeTab
	);

	const handleCardPress = (shipment: Shipment) => {
		switch (activeTab) {
			case "Matched Request":
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
				break;
			case "Shipments":
				router.push({
					pathname: "/(traveller)/shipmentDetails",
					params: {
						itemId: (shipment as TrackingShipment).trackingNumber,
						shipperName: "User Test",
						receiverName: "User Example",
						itemName: (shipment as TrackingShipment).item,
						fromLocation: "Ontario, Canada",
						toLocation: "Kampala, Uganda",
						status: "In Transit",
					},
				});

				break;
			case "Accepted":
				return;
		}
	};

	const renderMatchedRequest = ({ item }: { item: UserShipment }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => handleCardPress(item)}>
			<Ionicons
				name="person-circle"
				size={30}
				color={Theme.colors.primary}
				style={styles.cube}
			/>
			<View style={styles.cardText}>
				<Text style={styles.name}>{item.name}</Text>
				<Text style={styles.item}>{item.item}</Text>
			</View>
			<View style={styles.ratingContainer}>
				<Text style={styles.stars}>⭐ {item.rating}</Text>
			</View>
		</TouchableOpacity>
	);

	const renderTrackingShipment = ({ item }: { item: TrackingShipment }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => handleCardPress(item)}>
			<Ionicons
				name="cube-outline"
				size={30}
				color={Theme.colors.yellow}
				style={styles.cube}
			/>
			<View style={styles.cardText}>
				<Text style={styles.name}>{item.trackingNumber}</Text>
				<Text style={styles.item}>{item.item}</Text>
			</View>
			<View
				style={[
					styles.statusBadge,
					item.progress === "Delivered"
						? styles.delivered
						: styles.inTransit,
				]}>
				<Text
					style={[
						styles.statusText,
						item.progress === "Delivered"
							? styles.deliveredText
							: styles.inTransitText,
					]}>
					{item.progress === "Delivered" ? "Delivered" : "In Transit"}
				</Text>
			</View>
		</TouchableOpacity>
	);

	const renderShipment = ({ item }: { item: Shipment }) => {
		if (activeTab === "Shipments") {
			return renderTrackingShipment({ item: item as TrackingShipment });
		} else {
			return renderMatchedRequest({ item: item as UserShipment });
		}
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
						style={[
							styles.tab,
							activeTab === tab && styles.activeTab,
						]}
						onPress={() => onTabChange(tab)}>
						<Text
							style={[
								styles.tabText,
								activeTab === tab && styles.activeTabText,
							]}>
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
				/>
			) : (
				<Text style={styles.emptyText}>
					No shipments found in this category.
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: Theme.spacing.sm,
		paddingHorizontal: Theme.screenPadding.horizontal / 2,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 30,
		fontWeight: "600",
		marginBottom: Theme.spacing.md,
		marginTop: Theme.spacing.md,
		color: Theme.colors.primary,
	},
	highlight: {
		color: Theme.colors.primary,
		fontWeight: "700",
	},
	tabContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 30,
	},
	tab: {
		flex: 1,
		marginHorizontal: Theme.spacing.xs,
		paddingVertical: 5,
		borderRadius: 12,
		backgroundColor: "#C6C6C6",
		alignItems: "center",
	},
	activeTab: {
		backgroundColor: Theme.colors.yellow,
	},
	tabText: {
		color: "#484848",
		fontWeight: "500",
	},
	activeTabText: {
		color: Theme.colors.text.dark,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: Theme.borderRadius.md,
		padding: Theme.spacing.md,
		marginVertical: Theme.spacing.sm,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: Theme.borderRadius.md,
		marginRight: Theme.spacing.md,
	},
	cube: {
		borderRadius: Theme.borderRadius.md,
		marginRight: Theme.spacing.md,
	},
	cardText: {
		flex: 1,
	},
	name: {
		fontWeight: "600",
		fontSize: 16,
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
	item: {
		color: "#888",
	},
	ratingContainer: {
		alignItems: "flex-end",
	},
	stars: {
		fontSize: 12,
	},
	rating: {
		color: "#888",
		fontWeight: "500",
	},
	emptyText: {
		textAlign: "center",
		color: "#999",
		marginTop: Theme.spacing.xxl,
	},
});

export default MyShipmentsForm;
