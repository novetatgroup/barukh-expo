import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MyShipmentsForm from "../components/forms/traveller/MyShipments";
import { Shipment } from "../types/shipments";

const MyShipmentsScreen = () => {
  const { tab } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    }
  }, [tab]);

  const sampleShipments: Shipment[] = [
    {
      id: "1",
      name: "Miles Zawedde",
      item: "MacBook Pro",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=1",
      status: "Accepted",
    },
    {
      id: "2",
      name: "Miles Zawedde",
      item: "MacBook Pro",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=2",
      status: "Accepted",
    },
    {
      id: "3",
      name: "Miles Zawedde",
      item: "MacBook Pro",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=3",
      status: "Rejected",
    },
    {
      id: "4",
      name: "Miles Zawedde",
      item: "MacBook Pro",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=4",
      status: "Accepted",
    },
    {
      id: "5",
      name: "Emily Watson",
      item: "Sony Camera",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=5",
      status: "Cancelled",
    },
    {
      id: "6",
      name: "Michael Brown",
      item: "Gaming Laptop",
      rating: 4.7,
      avatar: "https://i.pravatar.cc/100?img=6",
      status: "Accepted",
    },
    {
      id: "7",
      name: "Sarah Johnson",
      item: "iPad Air",
      rating: 4.5,
      avatar: "https://i.pravatar.cc/100?img=7",
      status: "Rejected",
    },
    {
      id: "8",
      name: "David Chen",
      item: "Sony Headphones",
      rating: 4.8,
      avatar: "https://i.pravatar.cc/100?img=8",
      status: "Cancelled",
    },
    {
      id: "9",
      trackingNumber: "#SK1058",
      item: "MacBook Pro",
      status: "Shipments",
      progress: "In Transit",
    },
    {
      id: "10",
      trackingNumber: "#SK1059",
      item: "iPhone 15 Pro",
      status: "Shipments",
      progress: "Delivered",
    },
    {
      id: "11",
      trackingNumber: "#BK1624",
      item: "Sony Camera",
      status: "Shipments",
      progress: "In Transit",
    },
    {
      id: "12",
      trackingNumber: "#SK2001",
      item: "iPad Air",
      status: "Shipments",
      progress: "Delivered",
    },
  ];

  const handleCardPress = () => {
    console.log("Selected shipment:");
  };

  return (
    <View style={{ flex: 1 }}>
      <MyShipmentsForm
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shipments={sampleShipments}
        onCardPress={handleCardPress}
      />
    </View>
  );
};

export default MyShipmentsScreen;
