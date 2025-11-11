import { BarukhGoIcon, BarukhSendIcon } from "@/assets/svgs";

export const ROLES = {
  TRAVELLER: "TRAVELLER",
  SENDER: "SENDER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_OPTIONS = [
  {
    value: ROLES.SENDER,
    title: "Barukh Send",
    subtitle: "Package Received by Traveller",
    icon: BarukhSendIcon,
  },
  {
    value: ROLES.TRAVELLER,
    title: "Barukh Go",
    subtitle: "Transport items or people on your trip",
    icon: BarukhGoIcon,
  },
];
