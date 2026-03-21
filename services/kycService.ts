import { apiRequest, API_ENDPOINTS } from "./api";

export interface UploadUrlEntry {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

export interface UploadUrls {
  selfie: UploadUrlEntry;
  id_front: UploadUrlEntry;
  id_back: UploadUrlEntry;
}

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
    idType: string;
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
  async getUploadUrls(userId: string, accessToken: string) {
    return apiRequest<GetUploadUrlsResponse>(
      API_ENDPOINTS.kyc.getUploadUrls(userId),
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

  async uploadImageToS3(imageUri: string, uploadUrl: string): Promise<void> {
    const fileResponse = await fetch(imageUri);
    const blob = await fileResponse.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    });
    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: HTTP ${uploadResponse.status}`);
    }
  },
};
