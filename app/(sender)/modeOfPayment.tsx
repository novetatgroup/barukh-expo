import ModeOfPaymentForm from "@/components/forms/payments/ModeOfPaymentForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";

type PaymentMode = "Mobile Money" | "Paypal" | "Apple Pay" | "Wallet Pay" | "Cash On Delivery";

const ModeOfPaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shipmentCost?: string;
    insurance?: string;
    total?: string;
    payAmount?: string;
  }>();
  const [selectedMode, setSelectedMode] = useState<PaymentMode>("Paypal");

  const handleSelectMode = (mode: PaymentMode) => {
    setSelectedMode(mode);
    router.push({
      pathname: "/(sender)/payScreen",
      params: {
        mode,
        shipmentCost: params.shipmentCost || "$120",
        insurance: params.insurance || "$3.20",
        total: params.total || "$123.20",
        payAmount: params.payAmount || "$48.20",
      },
    });
  };

  return (
    <ModeOfPaymentForm
      selectedMode={selectedMode}
      onBack={() => router.back()}
      onSelectMode={handleSelectMode}
    />
  );
};

export default ModeOfPaymentScreen;
