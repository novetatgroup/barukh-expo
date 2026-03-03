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
    subtitle: "Ship packages with trusted travellers",
    icon: BarukhSendIcon,
  },
  {
    value: ROLES.TRAVELLER,
    title: "Barukh Go",
    subtitle: "Earn by delivering packages on your trips",
    icon: BarukhGoIcon,
  },
];
