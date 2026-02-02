import * as Yup from "yup";

export type PackageFormValues = {
  // Step 1 - Travel Details
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
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
  departureAt: string;
  arrivalAt: string;
  mode: string;
  flightNumber?: string;
  vehiclePlate?: string;
};

export const initialFormValues: PackageFormValues = {
  originCountry: "",
  originCity: "",
  destinationCountry: "",
  destinationCity: "",
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
  originCountry: Yup.string().required("Origin country is required"),
  originCity: Yup.string().required("Origin city is required"),
  destinationCountry: Yup.string().required("Destination country is required"),
  destinationCity: Yup.string().required("Destination city is required"),
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
