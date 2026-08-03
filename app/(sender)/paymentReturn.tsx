import PaymentReturnForm from "@/components/forms/payments/PaymentReturnForm";
import { usePaymentReturn } from "@/hooks/usePaymentReturn";
import React from "react";

const PaymentReturnScreen = () => {
  const paymentReturn = usePaymentReturn();
  return <PaymentReturnForm {...paymentReturn} />;
};

export default PaymentReturnScreen;
