import { PayoutCountry, PayoutCurrency } from "@/types/payment";

export type PayoutCountryConfig = {
  country: PayoutCountry;
  countryCode: "UG" | "KE" | "TZ" | "RW";
  currency: PayoutCurrency;
};

export const PAYOUT_COUNTRIES: PayoutCountryConfig[] = [
  {
    country: "Uganda",
    countryCode: "UG",
    currency: "UGX",
  },
  {
    country: "Kenya",
    countryCode: "KE",
    currency: "KES",
  },
  {
    country: "Tanzania",
    countryCode: "TZ",
    currency: "TZS",
  },
  {
    country: "Rwanda",
    countryCode: "RW",
    currency: "RWF",
  },
];

export const getPayoutCountryConfig = (country: PayoutCountry) =>
  PAYOUT_COUNTRIES.find((item) => item.country === country) ?? PAYOUT_COUNTRIES[0];
