import RoleSelectionForm from "@/components/forms/auth/RoleSelectionForm";
import { Role } from "@/constants/roles";
import { AuthContext } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { kycService } from "@/services/kycService";
import { senderService } from "@/services/senderService";
import { travellerService } from "@/services/travellerService";
import { userService } from "@/services/userService";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";

const RoleSelectionScreen = () => {
  const { userId, accessToken } = useContext(AuthContext);
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleUpdate = async (role: Role) => {
    if (isLoading) return;

    setSelectedRole(role);
    setIsLoading(true);

    if (!userId || !accessToken) {
      Toast.error("Session error. Please log in again.");
      setSelectedRole(null);
      setIsLoading(false);
      return;
    }

    const { error, ok } = await userService.updateRole(userId, role, accessToken);

    if (ok) {
      Toast.success("Role updated successfully!");
      await setRole(role);

      const { data: userProfile } = await userService.getUser(userId, accessToken);

      if (userProfile) {
        // Provision both a sender and traveller profile up front, regardless
        // of which mode was picked, so switching modes later (or any screen
        // that assumes a sender/traveller record exists) doesn't depend on
        // the user having taken an action first. Best-effort: apiRequest
        // never throws, and failures here don't block navigation since the
        // existing lazy-creation fallbacks (send package / create trip)
        // still cover the case where a profile is missing.
        const profileParams = {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        };
        await Promise.all([
          senderService.createSender(profileParams, accessToken),
          travellerService.createTraveller(profileParams, accessToken),
        ]);
      }

      if (userProfile && !userProfile.isActive) {
        const { data: jobStatus } = await kycService.getJobStatus(userId, accessToken);
        if (jobStatus?.status === "SUCCESS") {
          router.replace("/(tabs)/home");
        } else if (jobStatus?.status === "PROCESSING" || jobStatus?.status === "FAILED") {
          router.replace("/(KYC)/verificationPendingScreen");
        } else {
          router.replace("/(KYC)/KYCLanding");
        }
      } else {
        router.replace("/(tabs)/home");
      }
    } else {
      Toast.error(error || "Update failed. Please try again.");
      setSelectedRole(null);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <RoleSelectionForm
        selectedRole={selectedRole}
        onRoleSelect={handleRoleUpdate}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoleSelectionScreen;
