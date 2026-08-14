import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { extractShipmentsList, senderService, ShipmentDetails } from "@/services/senderService";
import { travellerService } from "@/services/travellerService";
import { useCallback, useContext, useEffect, useState } from "react";

export const useShipments = () => {
	const { role } = useRole();
	const { userId, accessToken } = useContext(AuthContext);
	const isTraveller = role === "TRAVELLER";

	const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchShipments = useCallback(async () => {
		if (!userId || !accessToken) {
			setShipments([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			if (isTraveller) {
				const travellerResult = await travellerService.getTraveller(accessToken);

				if (!travellerResult.ok || !travellerResult.data?.travellerId) {
					setShipments([]);
					if (travellerResult.status !== 404) {
						setError(travellerResult.error || "Unable to load traveller profile.");
					}
					return;
				}

				const shipmentsResult = await travellerService.getTravellerShipments(
					travellerResult.data.travellerId,
					accessToken
				);

				if (!shipmentsResult.ok || !shipmentsResult.data) {
					setShipments([]);
					if (shipmentsResult.status !== 404) {
						setError(shipmentsResult.error || "Unable to load shipments.");
					}
					return;
				}

				setShipments(extractShipmentsList(shipmentsResult.data));
			} else {
				const senderResult = await senderService.getSender(userId, accessToken);

				if (!senderResult.ok || !senderResult.data?.senderId) {
					setShipments([]);
					if (senderResult.status !== 404) {
						setError(senderResult.error || "Unable to load sender profile.");
					}
					return;
				}

				const shipmentsResult = await senderService.getSenderShipments(
					senderResult.data.senderId,
					accessToken
				);

				if (!shipmentsResult.ok || !shipmentsResult.data) {
					setShipments([]);
					if (shipmentsResult.status !== 404) {
						setError(shipmentsResult.error || "Unable to load shipments.");
					}
					return;
				}

				setShipments(extractShipmentsList(shipmentsResult.data));
			}
		} catch {
			setShipments([]);
			setError("Unable to load shipments.");
		} finally {
			setLoading(false);
		}
	}, [accessToken, isTraveller, userId]);

	useEffect(() => {
		fetchShipments();
	}, [fetchShipments]);

	return { shipments, loading, error, isTraveller, refresh: fetchShipments };
};
