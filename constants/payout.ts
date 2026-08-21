import { PayoutCountry, PayoutCurrency } from "@/types/payment";

export type PayoutCountryConfig = {
  country: PayoutCountry;
  countryCode: "UG" | "KE" | "TZ" | "RW" ;
  currency: PayoutCurrency;
};

export const PAYOUT_COUNTRIES: PayoutCountryConfig[] = [
  {
    country: "Uganda",
    countryCode: "UG",
    currency: "USD",
  },
  {
    country: "Kenya",
    countryCode: "KE",
    currency: "USD",
  },
  {
    country: "Tanzania",
    countryCode: "TZ",
    currency: "USD",
  },
  {
    country: "Rwanda",
    countryCode: "RW",
    currency: "USD",
  },
];

export const getPayoutCountryConfig = (country: PayoutCountry) =>
  PAYOUT_COUNTRIES.find((item) => item.country === country) ?? PAYOUT_COUNTRIES[0];
