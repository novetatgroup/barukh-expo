import PayScreenForm from "@/components/forms/payments/PayScreenForm";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

const PayScreen = () => {
  const params = useLocalSearchParams<{
    shipmentCost?: string;
    insurance?: string;
    total?: string;
    payAmount?: string;
  }>();

  return (
    <PayScreenForm
      shipmentCost={params.shipmentCost || "$120"}
      insurance={params.insurance || "$3.20"}
      total={params.total || "$123.20"}
      payAmount={params.payAmount || "$48.20"}
      onBack={() => router.back()}
      onPay={() => router.replace("/(tabs)/shipments")}
    />
  );
};

export default PayScreen;
