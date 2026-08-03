import { TRIP_CATEGORY_OPTIONS } from "@/types/trip";

export const categoryOptions = [...TRIP_CATEGORY_OPTIONS];

export const fragileOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const urgencyOptions = [
  { label: "Not urgent", value: "1" },
  { label: "Somewhat urgent", value: "2" },
  { label: "Urgent", value: "3" },
  { label: "Very urgent", value: "4" },
  { label: "Critical", value: "5" },
];
