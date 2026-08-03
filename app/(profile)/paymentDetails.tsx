import PaymentDetailsForm from "@/components/forms/payments/PaymentDetailsForm";
import { usePaymentDetails } from "@/hooks/usePaymentDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const PaymentDetailsScreen = () => {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const details = usePaymentDetails(reference);
  return <PaymentDetailsForm {...details} />;
};

export default PaymentDetailsScreen;
