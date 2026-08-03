import PayoutAccountsForm from "@/components/forms/payments/PayoutAccountsForm";
import { usePayoutAccounts } from "@/hooks/usePayoutAccounts";
import React from "react";

const PayoutAccountsScreen = () => {
  const payouts = usePayoutAccounts();
  return <PayoutAccountsForm {...payouts} />;
};

export default PayoutAccountsScreen;
