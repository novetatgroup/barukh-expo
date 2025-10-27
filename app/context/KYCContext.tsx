import React, { createContext, useState, ReactNode, useContext } from "react";
import AuthContext from "./AuthContext";

interface KYCState {
  frontImage: string | null;
  backImage: string | null;
  selfieImage: string | null;
  country: string | null;
  id_type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE" | null;
}

interface ImageDetail {
  image_type_id: number;
  image: string | null;
}

interface id_info {
  country: string | null;
  id_type: string | null;
}

interface Payload {
  userId: number | null; 
  images: ImageDetail[];
  idInfo: id_info | null;
}

interface KYCContextType extends KYCState {
  setKYCState: (state: KYCState) => void;
  addImage: (imageDetail: ImageDetail) => void;
  updateIdInfo: (country: string, id_type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE") => void;
  resetKYC: () => void;
  buildPayload: () => Payload;
}

export const KYCContext = createContext<KYCContextType>({} as KYCContextType);

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const [kycState, setKYCStateInternal] = useState<KYCState>({
    frontImage: null,
    backImage: null,
    selfieImage: null,
    country: null,
    id_type: null,
  });

  const authContext = useContext(AuthContext);

  const setKYCState = (state: KYCState) => {
    setKYCStateInternal(state);
  };

  const addImage = (imageDetail: ImageDetail) => {
    setKYCStateInternal((prevState) => {
      const updatedState = { ...prevState };

      if (imageDetail.image_type_id === 3) {
        updatedState.frontImage = imageDetail.image;
      } else if (imageDetail.image_type_id === 7) {
        updatedState.backImage = imageDetail.image;
      } else if (imageDetail.image_type_id === 2) {
        updatedState.selfieImage = imageDetail.image;
      }

      return updatedState;
    });
  };

  const updateIdInfo = (country: string, id_type: "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENCE") => {
    setKYCStateInternal((prevState) => ({
      ...prevState,
      country,
      id_type,
    }));
  };

  const resetKYC = () => {
    setKYCStateInternal({
      frontImage: null,
      backImage: null,
      selfieImage: null,
      country: null,
      id_type: null,
    });
  };

  const buildPayload = (): Payload => {
    const images: ImageDetail[] = [];

    if (kycState.frontImage) {
      images.push({ image_type_id: 3, image: kycState.frontImage });
    }
    if (kycState.backImage) {
      images.push({ image_type_id: 7, image: kycState.backImage });
    }
    if (kycState.selfieImage) {
      images.push({ image_type_id: 2, image: kycState.selfieImage });
    }

    const userId = authContext.userId;
    const numericUserId = userId && !isNaN(Number(userId)) ? Number(userId) : null;

    return {
      userId: numericUserId, 
      idInfo:
        kycState.country && kycState.id_type
          ? {
              country: kycState.country,
              id_type: kycState.id_type,
            }
          : null,
      images,
    };
  };

  return (
    <KYCContext.Provider
      value={{
        ...kycState,
        setKYCState,
        updateIdInfo,
        addImage,
        resetKYC,
        buildPayload,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export default KYCContext;