import * as Yup from "yup";

export type LocationData = {
  placeId: string;
  description: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type ShipmentFormValues = {
  // Step 1 - Item Details
  itemName: string;
  category: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  isFragile: string;
  quantity: string;
  photoUri: string;

  // Step 2 - Delivery Details
  origin: LocationData | null;
  originCountry: string;
  originCity: string;
  originLat: number | null;
  originLon: number | null;
  destination: LocationData | null;
  destinationCountry: string;
  destinationCity: string;
  destinationLat: number | null;
  destinationLon: number | null;
  urgencyLevel: string;
  requiredByDate: string;
};

export type ShipmentSubmitData = {
  name: string;
  category: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  fragile: boolean;
  quantity: number;
  originCountry: string;
  originCity: string;
  originLat?: number;
  originLon?: number;
  destinationCountry: string;
  destinationCity: string;
  destinationLat?: number;
  destinationLon?: number;
  urgencyLevel: number;
  requiredByDate: string;
  photoUri?: string;
};

export const initialFormValues: ShipmentFormValues = {
  itemName: "",
  category: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  isFragile: "",
  quantity: "",
  photoUri: "",
  origin: null,
  originCountry: "",
  originCity: "",
  originLat: null,
  originLon: null,
  destination: null,
  destinationCountry: "",
  destinationCity: "",
  destinationLat: null,
  destinationLon: null,
  urgencyLevel: "",
  requiredByDate: "",
};

export const Step1ValidationSchema = Yup.object().shape({
  itemName: Yup.string().required("Item name is required"),
  category: Yup.string().required("Category is required"),
  weightKg: Yup.number()
    .required("Weight is required")
    .positive("Must be positive"),
  lengthCm: Yup.number()
    .required("Length is required")
    .positive("Must be positive"),
  widthCm: Yup.number()
    .required("Width is required")
    .positive("Must be positive"),
  heightCm: Yup.number()
    .required("Height is required")
    .positive("Must be positive"),
  isFragile: Yup.string().required("Please specify if item is fragile"),
  quantity: Yup.number()
    .required("Quantity is required")
    .positive("Must be positive")
    .integer("Must be a whole number"),
});

export const Step2ValidationSchema = Yup.object().shape({
  origin: Yup.object()
    .nullable()
    .required("Origin location is required")
    .test("has-city", "Please select a valid city", (value) =>
      value !== null && (value as LocationData).city !== ""
    ),
  destination: Yup.object()
    .nullable()
    .required("Destination location is required")
    .test("has-city", "Please select a valid city", (value) =>
      value !== null && (value as LocationData).city !== ""
    ),
  urgencyLevel: Yup.string().required("Urgency level is required"),
  requiredByDate: Yup.string().required("Required by date is required"),
});
