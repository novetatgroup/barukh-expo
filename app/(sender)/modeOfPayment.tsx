import PaymentCheckoutForm from "@/components/forms/payments/PaymentCheckoutForm";
import { usePaymentCheckout } from "@/hooks/usePaymentCheckout";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const ModeOfPaymentScreen = () => {
  const params = useLocalSearchParams<{ shipmentId?: string }>();
  const checkout = usePaymentCheckout({
    shipmentId: params.shipmentId ?? "",
  });

  return <PaymentCheckoutForm {...checkout} />;
};

export default ModeOfPaymentScreen;
