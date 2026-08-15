import { Theme } from "@/constants/Theme";
import { ShipmentDetails } from "@/services/senderService";
import { formatMoney } from "@/utils/formatting";
import {
	formatShipmentStatus,
	normalizeShipmentStatus,
	ShipmentStage,
} from "@/utils/shipmentTracking";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

export const getShipmentDetailsRoute = (
	shipment: ShipmentDetails,
	isTraveller: boolean
): {
	pathname: "/(traveller)/shipmentDetails" | "/(sender)/shipmentDetails";
	params: Record<string, string>;
} => ({
	pathname: isTraveller ? "/(traveller)/shipmentDetails" : "/(sender)/shipmentDetails",
	params: {
		id: shipment.id,
		shipmentId: shipment.id,
		orderId: shipment.referenceNumber,
		itemId: `#${shipment.packageId.slice(0, 8).toUpperCase()}`,
		itemName: shipment.package.name,
		progress: formatShipmentStatus(shipment.status),
		shipmentCost: formatMoney(shipment.priceMinor, shipment.currency),
		requestedAt: shipment.requestedAt,
		fromLocation: shipment.package.originCity || shipment.travel.originCity,
		toLocation: shipment.package.destinationCity || shipment.travel.destinationCity,
	},
});

const getStatusBadgeStyle = (stage: ShipmentStage) => {
	if (stage === "DELIVERED") {
		return {
			backgroundColor: Theme.colors.lightGreen,
			color: Theme.colors.primary,
		};
	}

	if (stage === "IN_TRANSIT") {
		return {
			backgroundColor: Theme.colors.lightPurple,
			color: Theme.colors.white,
		};
	}

	return {
		backgroundColor: Theme.colors.orange,
		color: Theme.colors.white,
	};
};

type ShipmentCardProps = {
	shipment: ShipmentDetails;
	isTraveller: boolean;
	onPress: () => void;
};

const ShipmentCard = ({ shipment, isTraveller, onPress }: ShipmentCardProps) => {
	const stage = normalizeShipmentStatus(shipment.status);
	const statusBadgeStyle = getStatusBadgeStyle(stage);
	const fromLocation = shipment.package.originCity || shipment.travel.originCity;
	const toLocation = shipment.package.destinationCity || shipment.travel.destinationCity;

	return (
		<TouchableOpacity style={styles.card} onPress={onPress}>
			<View
				style={[
					styles.iconContainer,
					{ backgroundColor: isTraveller ? "#EBF2F1" : Theme.colors.yellow },
				]}
			>
				<Ionicons
					name={(isTraveller ? "airplane-outline" : "cube-outline") as IconName}
					size={22}
					color={Theme.colors.primary}
				/>
			</View>

			<View style={styles.cardText}>
				<Text style={styles.name}>{shipment.referenceNumber}</Text>
				<Text style={styles.item}>
					{shipment.package.name}
					{"\n"}Charge: {formatMoney(shipment.priceMinor, shipment.currency)}
				</Text>
				<Text style={styles.detail}>
					{fromLocation} → {toLocation}
				</Text>
			</View>

			<View style={styles.metaContainer}>
				<View style={[styles.statusBadge, { backgroundColor: statusBadgeStyle.backgroundColor }]}>
					<Text style={[styles.statusBadgeText, { color: statusBadgeStyle.color }]}>
						{formatShipmentStatus(shipment.status)}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default ShipmentCard;

const styles = StyleSheet.create({
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
	iconContainer: {
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
		maxWidth: 104,
	},
	statusBadge: {
		minHeight: 26,
		borderRadius: 13,
		paddingHorizontal: Theme.spacing.sm,
		paddingVertical: 5,
		alignItems: "center",
		justifyContent: "center",
	},
	statusBadgeText: {
		fontSize: 11,
		fontFamily: "Inter-SemiBold",
		textAlign: "center",
	},
});
