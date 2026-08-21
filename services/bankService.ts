import { API_ENDPOINTS, apiRequest } from "@/services/api";

export interface SupportedBank {
  id: string;
  code: string;
  name: string;
}

export interface SupportedBanksResponse {
  status: "success";
  message: string;
  data: SupportedBank[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSupportedBank = (value: unknown): value is SupportedBank =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  typeof value.code === "string" &&
  value.code.trim().length > 0 &&
  typeof value.name === "string" &&
  value.name.trim().length > 0;

const parseSupportedBanksResponse = (value: unknown): SupportedBanksResponse | null => {
  if (
    !isRecord(value) ||
    value.status !== "success" ||
    typeof value.message !== "string" ||
    !Array.isArray(value.data) ||
    !value.data.every(isSupportedBank)
  ) {
    return null;
  }

  return {
    status: "success",
    message: value.message,
    data: value.data,
  };
};

export const bankService = {
  async getSupportedBanks(countryCode: string, accessToken: string) {
    const result = await apiRequest<unknown>(
      API_ENDPOINTS.banks.getSupportedAccounts(countryCode),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const parsed = result.ok ? parseSupportedBanksResponse(result.data) : null;

    return {
      ...result,
      data: parsed,
      error:
        result.ok && !parsed
          ? "The bank service returned an unsupported response."
          : result.error,
      ok: result.ok && Boolean(parsed),
    };
  },
};
