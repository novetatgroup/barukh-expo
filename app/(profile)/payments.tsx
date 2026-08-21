import PaymentActivityForm from "@/components/forms/payments/PaymentActivityForm";
import { usePaymentActivity } from "@/hooks/usePaymentActivity";
import React from "react";

const PaymentsScreen = () => {
  const activity = usePaymentActivity();
  return <PaymentActivityForm {...activity} />;
};

export default PaymentsScreen;
