import { apiRequest, API_ENDPOINTS } from "./api";

export type DocumentIdType = "PASSPORT" | "IDENTITY_CARD" | "DRIVING_LICENSE";

export interface UploadUrlEntry {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

// Slot set depends on document type - a passport has no "id_back" slot since it has no
// meaningful back page, unlike a national ID or driving license.
export type UploadUrls = Record<string, UploadUrlEntry>;

export interface GetUploadUrlsResponse {
  urls: UploadUrls;
  jobId: string;
}

export interface VerificationImage {
  imageTypeId: number;
  imageKey: string;
}

export interface SubmitVerificationParams {
  userId: string;
  jobId: string;
  idInfo: {
    idType: DocumentIdType;
    countryTypes: string;
  };
  images: VerificationImage[];
}

export interface SubmitVerificationResponse {
  message: string;
  jobId: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: string; // "PROCESSING" = processing, "FAILED" = failed, success status TBD
  message: string;
  SmileJobID: string;
  ResultText?: string;
}

export const kycService = {
  async getUploadUrls(userId: string, idType: DocumentIdType, accessToken: string) {
    return apiRequest<GetUploadUrlsResponse>(
      API_ENDPOINTS.kyc.getUploadUrls(userId, idType),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },

  async submitVerification(params: SubmitVerificationParams, accessToken: string) {
    return apiRequest<SubmitVerificationResponse>(
      API_ENDPOINTS.kyc.submitVerification,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: params,
      }
    );
  },

  async getJobStatus(userId: string, accessToken: string) {
    return apiRequest<JobStatusResponse>(API_ENDPOINTS.kyc.getJobStatus, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { userId },
    });
  },
};
