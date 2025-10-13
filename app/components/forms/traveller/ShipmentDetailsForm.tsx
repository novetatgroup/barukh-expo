import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/app/constants/Theme";
import CustomButton from "../../ui/CustomButton";

interface shipmentDetailsFormProps {
    itemId: string;
    shipperName: string;
    receiverName: string;
    itemName: string;
    fromLocation: string;
    toLocation: string;
    status: string;
    progress: string;
    onBack: () => void;
}

const ShipmentDetailsForm: React.FC<shipmentDetailsFormProps> = ({
    itemId,
    shipperName,
    receiverName,
    itemName,
    fromLocation,
    toLocation,
    progress,
    status,
    onBack,
}) => {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle" size={50} color={Theme.colors.primary} />
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
                                    progress === "Delivered"
                                        ? styles.deliveredText
                                        : styles.inTransitText,
                                ]}
                            >
                                {progress === "Delivered" ? "Delivered" : "In Transit"}
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

                    <CustomButton
                        title='Update Order'
                   
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Theme.spacing.xxxxxl,
        backgroundColor: Theme.colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.md,
        backgroundColor: Theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.text.border,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: Theme.typography.h2.fontWeight,
        color: Theme.colors.black,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    userCard: {
        backgroundColor: Theme.colors.white,
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
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
    avatarContainer: {
        marginRight: Theme.spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: Theme.borderRadius.lg,
        marginRight: Theme.spacing.md,
    },
    avatarPlaceholder: {
        backgroundColor: '#D4A574',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.white,
    },
    userTextContainer: {
        flex: 1,
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    inTransit: {
        backgroundColor: Theme.colors.lightPurple,
    },
    delivered: {
        backgroundColor: Theme.colors.lightGreen,
    },
    inTransitText: {
        color:Theme.colors.white,
        fontWeight: "400",
    },
    deliveredText: {
        color: "#155724",
        fontWeight: "400",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
    },
    userName: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.black,
        marginBottom: 2,
    },
    userSubtitle: {
        fontSize: Theme.typography.caption.fontSize,
        color: Theme.colors.text.gray,
    },
    detailsGrid: {
        marginBottom: Theme.spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.md,
        gap: Theme.spacing.md,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: Theme.typography.caption.fontSize,
        color: Theme.colors.text.gray,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.black,
        fontWeight: '500',
    },
});

export default ShipmentDetailsForm;