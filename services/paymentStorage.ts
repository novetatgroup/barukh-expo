import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafePaymentRecovery } from "@/types/payment";

const RECOVERY_PREFIX = "barukh:payment-recovery:";
const MOCK_DATA_PREFIX = "barukh:payment-mock:";

export const getPaymentRecovery = async (
  userId: string,
): Promise<SafePaymentRecovery | null> => {
  const value = await AsyncStorage.getItem(`${RECOVERY_PREFIX}${userId}`);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as SafePaymentRecovery;
    return parsed.userId === userId ? parsed : null;
  } catch {
    await AsyncStorage.removeItem(`${RECOVERY_PREFIX}${userId}`);
    return null;
  }
};

export const savePaymentRecovery = async (recovery: SafePaymentRecovery) => {
  await AsyncStorage.setItem(
    `${RECOVERY_PREFIX}${recovery.userId}`,
    JSON.stringify(recovery),
  );
};

export const clearPaymentRecovery = async (userId: string) => {
  await AsyncStorage.removeItem(`${RECOVERY_PREFIX}${userId}`);
};

export const getMockPaymentData = async <T>(userId: string): Promise<T | null> => {
  const value = await AsyncStorage.getItem(`${MOCK_DATA_PREFIX}${userId}`);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    await AsyncStorage.removeItem(`${MOCK_DATA_PREFIX}${userId}`);
    return null;
  }
};

export const saveMockPaymentData = async <T>(userId: string, data: T) => {
  await AsyncStorage.setItem(`${MOCK_DATA_PREFIX}${userId}`, JSON.stringify(data));
};

export const clearUserPaymentData = async (userId: string) => {
  await AsyncStorage.multiRemove([
    `${RECOVERY_PREFIX}${userId}`,
    `${MOCK_DATA_PREFIX}${userId}`,
  ]);
};
