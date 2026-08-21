import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafePaymentRecovery } from "@/types/payment";

const RECOVERY_PREFIX = "barukh:payment-recovery:";

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

export const clearUserPaymentData = async (userId: string) => {
  await AsyncStorage.removeItem(`${RECOVERY_PREFIX}${userId}`);
};
