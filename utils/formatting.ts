export const formatMoney = (priceMinor: number, currency: string = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(priceMinor / 100);
  } catch {
    return `${currency} ${(priceMinor / 100).toFixed(2)}`;
  }
};
