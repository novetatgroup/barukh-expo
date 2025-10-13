import React, { useState } from "react";
import { View } from "react-native";
import MyShipmentsForm from "../components/forms/traveller/MyShipments";
import { Shipment } from '../types/shipments';

const MyShipmentsScreen = () => {
  const [activeTab, setActiveTab] = useState("Matched Request");

  const sampleShipments: Shipment[] = [
    {
      id: "1",
      name: "Miles Zawedde",
      item: "MacBook Pro",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=1",
      status: "Matched Request",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      item: "iPhone 15 Pro",
      rating: 4.8,
      avatar: "https://i.pravatar.cc/100?img=2",
      status: "Matched Request",
    },
    {
      id: "3",
      name: "David Chen",
      item: "iPad Air",
      rating: 4.9,
      avatar: "https://i.pravatar.cc/100?img=3",
      status: "Matched Request",
    },

    {
      id: "4",
      name: "Emily Watson",
      item: "Sony Camera",
      rating: 5.0,
      avatar: "https://i.pravatar.cc/100?img=4",
      status: "Accepted",
    },
    {
      id: "5",
      name: "Michael Brown",
      item: "Gaming Laptop",
      rating: 4.7,
      avatar: "https://i.pravatar.cc/100?img=5",
      status: "Accepted",
    },

    {
      id: "6",
      trackingNumber: "#SK1058",
      item: "MacBook Pro",
      status: "Shipments",
      progress:"In Transit"
    },
    {
      id: "7",
      trackingNumber: "#SK1059",
      item: "iPhone 15 Pro",
      status: "Shipments",
      progress:"Delivered"
    },
    {
      id: "8",
      trackingNumber: "#BK1624",
      item: "Sony Camera",
      status: "Shipments",
      progress:"In Transit"
    },
    {
      id: "9",
      trackingNumber: "#SK2001",
      item: "iPad Air",
      status: "Shipments",
      progress:"Delivered"
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