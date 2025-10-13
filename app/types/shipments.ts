export type UserShipment = {
  id: string;
  name: string;
  item: string;
  rating: number;
  avatar: string;
  status: "Matched Request" | "Accepted";
};

export type TrackingShipment = {
  id: string;
  trackingNumber: string;
  item: string;
  status: "Shipments";
  progress:string
};

export type Shipment = UserShipment | TrackingShipment;
