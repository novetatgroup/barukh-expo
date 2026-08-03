import { PaymentExecutionMode } from "@/types/payment";

const configuredMode = process.env.EXPO_PUBLIC_PAYMENT_MODE?.toLowerCase();

export const getPaymentExecutionMode = (): PaymentExecutionMode => {
  if (!__DEV__) {
    return configuredMode === "api" ? "api" : "blocked";
  }

  if (configuredMode === "api" || configuredMode === "blocked") {
    return configuredMode;
  }

  return "mock";
};

// These contracts are still missing: amount units, customer/card ID retrieval,
// redirect allowlisting, failed retry rules, and payment status recovery.
export const isChargeExecutionReady = false;

const configuredRedirectHosts = process.env.EXPO_PUBLIC_PAYMENT_REDIRECT_HOSTS
  ?.split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const allowedRedirectHosts = new Set(
  configuredRedirectHosts?.length
    ? configuredRedirectHosts
    : ["checkout.flutterwave.com", "staging.api.barukhconnector.com"],
);

export const isAllowedPaymentRedirect = (redirectUrl: string): boolean => {
  try {
    const url = new URL(redirectUrl);
    return url.protocol === "https:" && allowedRedirectHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
