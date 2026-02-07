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

export type PackageFormValues = {
  // Step 1 - Travel Details
  origin: LocationData | null;
  destination: LocationData | null;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  originLatitude: number | null;
  originLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  mode: string;
  flightNumber: string;
  vehiclePlate: string;
  // Step 2 - Package Details
  allowedCategories: string[];
  maxWeightKg: number;
  maxHeightCm: string;
  maxWidthCm: string;
  maxLengthCm: string;
};

export type PackageSubmitData = {
  allowedCategories: string[];
  maxWeightKg: number;
  maxHeightCm: number;
  maxWidthCm: number;
  maxLengthCm: number;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureAt: string;
  arrivalAt: string;
  mode: string;
  flightNumber?: string;
  vehiclePlate?: string;
};

export const initialFormValues: PackageFormValues = {
  origin: null,
  destination: null,
  originCountry: "",
  originCity: "",
  destinationCountry: "",
  destinationCity: "",
  originLatitude: null,
  originLongitude: null,
  destinationLatitude: null,
  destinationLongitude: null,
  departureDate: "",
  departureTime: "",
  arrivalDate: "",
  arrivalTime: "",
  mode: "",
  flightNumber: "",
  vehiclePlate: "",
  allowedCategories: [],
  maxWeightKg: 0,
  maxHeightCm: "",
  maxWidthCm: "",
  maxLengthCm: "",
};

export const Step1ValidationSchema = Yup.object().shape({
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
  departureDate: Yup.string().required("Departure date is required"),
  departureTime: Yup.string().required("Departure time is required"),
  arrivalDate: Yup.string().required("Arrival date is required"),
  arrivalTime: Yup.string().required("Arrival time is required"),
  mode: Yup.string().required("Mode of transport is required"),
  flightNumber: Yup.string().when("mode", {
    is: "FLIGHT",
    then: (schema) => schema.required("Flight number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  vehiclePlate: Yup.string().when("mode", {
    is: "CAR",
    then: (schema) => schema.required("Vehicle plate is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const Step2ValidationSchema = Yup.object().shape({
  allowedCategories: Yup.array().min(1, "Select at least one category"),
  maxWeightKg: Yup.number()
    .required("Package size is required")
    .positive("Must be positive"),
  maxHeightCm: Yup.number()
    .required("Max height is required")
    .positive("Must be positive"),
  maxWidthCm: Yup.number()
    .required("Max width is required")
    .positive("Must be positive"),
  maxLengthCm: Yup.number()
    .required("Max length is required")
    .positive("Must be positive"),
});
