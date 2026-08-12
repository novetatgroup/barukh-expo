import { PaymentExecutionMode } from "@/types/payment";

const configuredMode = process.env.EXPO_PUBLIC_PAYMENT_MODE?.toLowerCase();

export const getPaymentExecutionMode = (): PaymentExecutionMode =>
  configuredMode === "blocked" ? "blocked" : "api";

export const isChargeExecutionReady = true;

const configuredRedirectHosts = process.env.EXPO_PUBLIC_PAYMENT_REDIRECT_HOSTS
  ?.split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const allowedRedirectHosts = new Set(
  configuredRedirectHosts?.length
    ? configuredRedirectHosts
    : [
        "checkout.flutterwave.com",
        "checkout-v2.flutterwave.com",
        "ravemodal-dev.herokuapp.com",
        "staging.api.barukhconnector.com",
        "api.barukhconnector.com",
        "barukhconnector.com",
      ],
);

export const isAllowedPaymentRedirect = (redirectUrl: string): boolean => {
  try {
    const url = new URL(redirectUrl);
    return url.protocol === "https:" && allowedRedirectHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
