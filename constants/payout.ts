import { PayoutCountry, PayoutCurrency } from "@/types/payment";

export type PayoutCountryConfig = {
  country: PayoutCountry;
  currency: PayoutCurrency;
  banks: string[];
};

export const PAYOUT_COUNTRIES: PayoutCountryConfig[] = [
  {
    country: "Uganda",
    currency: "UGX",
    banks: ["Stanbic Bank Uganda", "Centenary Bank", "Absa Bank Uganda", "DFCU Bank"],
  },
  {
    country: "Kenya",
    currency: "KES",
    banks: ["KCB Bank Kenya", "Equity Bank Kenya", "Co-operative Bank of Kenya", "Absa Bank Kenya"],
  },
  {
    country: "Tanzania",
    currency: "TZS",
    banks: ["CRDB Bank", "NMB Bank", "Absa Bank Tanzania", "Stanbic Bank Tanzania"],
  },
  {
    country: "Rwanda",
    currency: "RWF",
    banks: ["Bank of Kigali", "I&M Bank Rwanda", "Equity Bank Rwanda", "BPR Bank Rwanda"],
  },
];

export const getPayoutCountryConfig = (country: PayoutCountry) =>
  PAYOUT_COUNTRIES.find((item) => item.country === country) ?? PAYOUT_COUNTRIES[0];
