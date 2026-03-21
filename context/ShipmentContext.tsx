import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ShipmentData {
  departure?: string;
  destination?: string;
  date?: string;
  time?: string;
  modeOfTravel?: string;
  spaceType?: string;
  spaceNumber?: string;

  userId?: number;
  originCountry?: string;
  originCity?: string;
  destinationCountry?: string;
  destinationCity?: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureAt?: string;
  arrivalAt?: string;
  mode?: string;
  flightNumber?: string;
  vehiclePlate?: string;

  allowedCategories?: string[];
  weight?: string;
  height?: string;
  width?: string;
  maxWeightKg?: number;
  maxHeightCm?: number;
  maxWidthCm?: number;
  maxLengthCm?: number;
}

export interface Shipment extends ShipmentData {
  id: string;
  status: 'active' | 'delivered' | 'cancelled';
  createdAt: Date;
}

interface ShipmentContextType {
  currentShipment: Partial<ShipmentData>;
  shipments: Shipment[];
  setCurrentShipment: React.Dispatch<React.SetStateAction<Partial<ShipmentData>>>;
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  clearCurrentShipment: () => void;
  getShipmentById: (id: string) => Shipment | undefined;
  isTravelerActive: boolean;
  setIsTravelerActive: React.Dispatch<React.SetStateAction<boolean>>;  
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentShipment, setCurrentShipment] = useState<Partial<ShipmentData>>({});
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isTravelerActive, setIsTravelerActive] = useState<boolean>(false);

  const clearCurrentShipment = () => {
    setCurrentShipment({});
  };

  const getShipmentById = (id: string) => {
    return shipments.find(shipment => shipment.id === id);
  };

  return (
    <ShipmentContext.Provider
      value={{
        currentShipment,
        shipments,
        setCurrentShipment,
        setShipments,
        clearCurrentShipment,
        getShipmentById,
        isTravelerActive,
        setIsTravelerActive,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
};
