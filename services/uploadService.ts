export const uploadService = {
  /**
   * PUTs a local file URI directly to a presigned S3 upload URL. Single source of truth for
   * the fetch-blob-PUT dance previously duplicated in kycService.ts and travellerService.ts.
   */
  async uploadToS3(fileUri: string, uploadUrl: string, contentType = "image/jpeg"): Promise<void> {
    const fileResponse = await fetch(fileUri);
    const blob = await fileResponse.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: HTTP ${uploadResponse.status}`);
    }
  },
};
