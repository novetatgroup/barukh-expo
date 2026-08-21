export const TRIP_CATEGORIES = [
  "ELECTRONIC",
  "DOCUMENT",
  "CLOTHING",
  "FOOD",
  "OTHER",
] as const;

export type TripCategory = (typeof TRIP_CATEGORIES)[number];

export const TRIP_CATEGORY_OPTIONS: {
  label: string;
  value: TripCategory;
}[] = [
  { label: "Electronics", value: "ELECTRONIC" },
  { label: "Documents", value: "DOCUMENT" },
  { label: "Clothing", value: "CLOTHING" },
  { label: "Food Items", value: "FOOD" },
  { label: "Other", value: "OTHER" },
];
