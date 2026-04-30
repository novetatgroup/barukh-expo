import { Theme } from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from "../../ui/CustomButton";

interface shipmentDetailsFormProps {
    headerTitle: string;
    shipmentId?: string;
    itemId: string;
    shipperName: string;
    receiverName: string;
    itemName: string;
    fromLocation: string;
    toLocation: string;
    status: string;
    progress: string;
    deliveryPhotoUrl?: string;
    onBack: () => void;
}

const ShipmentDetailsForm: React.FC<shipmentDetailsFormProps> = ({
    headerTitle,
    
    shipmentId,
    itemId,
    shipperName,
    receiverName,
    itemName,
    fromLocation,
    toLocation,
    progress,
    status,
    deliveryPhotoUrl,
    onBack,
}) => {
    const isDelivered = progress === "Delivered";
    const statusLabel = progress;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                    <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{headerTitle}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons
                        name="ellipsis-vertical"
                        size={22}
                        color={Theme.colors.black}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <View style={styles.packageIconContainer}>
                            <Ionicons name="cube-outline" size={20} color={Theme.colors.primary} />
                        </View>
                        <View style={styles.userTextContainer}>
                            <Text style={styles.userName}>{itemId}</Text>
                            <Text style={styles.userSubtitle}>{itemName}</Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                progress === "Delivered"
                                    ? styles.delivered
                                    : styles.inTransit,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    isDelivered
                                        ? styles.deliveredText
                                        : styles.inTransitText,
                                ]}
                            >
                                {statusLabel}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Shipper Name :</Text>
                                <Text style={styles.detailValue}>{shipperName}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Recipient Name :</Text>
                                <Text style={styles.detailValue}>{receiverName}</Text>
                            </View>
                        </View>

                        <View style={styles.lineContainer}>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>From :</Text>
                                <Text style={styles.detailValue}>{fromLocation}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>To :</Text>
                                <Text style={styles.detailValue}>{toLocation}</Text>
                            </View>
                        </View>
                    </View>

                    {deliveryPhotoUrl ? (
                        <>
                            <View style={styles.lineContainer}>
                                <View style={styles.line} />
                            </View>
                            <View style={styles.deliveryPhotoSection}>
                                <Text style={styles.sectionTitle}>Delivery Photo</Text>
                                <Image
                                    source={{ uri: deliveryPhotoUrl }}
                                    style={styles.deliveryPhoto}
                                    resizeMode="cover"
                                />
                            </View>
                        </>
                    ) : null}

                    <CustomButton
                        title='Update Order'
                        onPress={() =>
                            router.push({
                                pathname: "/(traveller)/trackingDetails",
                                params: {
                                    
                                    shipmentId,
                                    itemId,
                                    itemName,
                                    progress,
                                    status,
                                },
                            })
                        }
                        style={styles.actionButton}
                        textStyle={styles.actionButtonText}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background.secondary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 56,
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
      },
      headerButton: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
      },
      headerTitle: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        color: Theme.colors.text.dark,
      },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Theme.colors.background.border,
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Theme.spacing.md,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.xl,
    },
    userCard: {
        backgroundColor: Theme.colors.white,
        borderRadius: 20,
        padding: Theme.spacing.lg,
        shadowColor: Theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    packageIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: Theme.spacing.sm,
        backgroundColor: Theme.colors.yellow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userTextContainer: {
        flex: 1,
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: 18,
    },
    inTransit: {
        backgroundColor: Theme.colors.lightPurple,
    },
    delivered: {
        backgroundColor: Theme.colors.lightGreen,
    },
    inTransitText: {
        color: Theme.colors.white,
        fontFamily: "Inter-Regular",
    },
    deliveredText: {
        color: Theme.colors.primary,
        fontFamily: "Inter-Regular",
    },
    statusText: {
        fontSize: 13,
    },
    userName: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        color: Theme.colors.text.dark,
        marginBottom: 2,
    },
    userSubtitle: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.gray,
    },
    detailsGrid: {
        marginBottom: Theme.spacing.lg,
    },
    deliveryPhotoSection: {
        gap: Theme.spacing.sm,
        marginBottom: Theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        color: Theme.colors.text.dark,
    },
    deliveryPhoto: {
        width: '100%',
        height: 190,
        borderRadius: Theme.borderRadius.md,
        backgroundColor: Theme.colors.background.secondary,
    },
    detailRow: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.gray,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.dark,
    },
    actionButton: {
        marginTop: Theme.spacing.xl,
        marginBottom: 0,
        minHeight: 45,
        paddingVertical: Theme.spacing.sm,
    },
    actionButtonText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
    },
});

export default ShipmentDetailsForm;
