export const countryOptions = [
  { label: "Uganda", value: "UG" },
  { label: "Kenya", value: "KE" },
  { label: "Tanzania", value: "TZ" },
  { label: "Rwanda", value: "RW" },
  { label: "South Sudan", value: "SS" },
  { label: "DR Congo", value: "CD" },
];

const citiesByCountry: Record<string, string[]> = {
  UG: ["Kampala", "Entebbe", "Jinja", "Gulu", "Mbarara"],
  KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  TZ: ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar"],
  RW: ["Kigali", "Butare", "Gisenyi", "Ruhengeri"],
  SS: ["Juba", "Wau", "Malakal"],
  CD: ["Kinshasa", "Lubumbashi", "Goma", "Kisangani"],
};

export const getCitiesByCountry = (countryCode: string): string[] => {
  return citiesByCountry[countryCode] || [];
};

export const modeOptions = [
  { label: "Flight", value: "FLIGHT" },
  { label: "Car", value: "CAR" },
];

export const consignmentOptions = [
  "Electronics",
  "Documents",
  "Clothing",
  "Food Items",
  "Fragile Items",
  "Books",
];

export type PackageSizeOption = {
  label: string;
  value: number;
  icon: "cube-outline" | "cube" | "albums-outline";
};

export const packageSizeOptions: PackageSizeOption[] = [
  { label: "< 1KG", value: 1, icon: "cube-outline" },
  { label: "3KG - 10KG", value: 10, icon: "cube" },
  { label: "> 10KG", value: 15, icon: "albums-outline" },
];
