import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '@/app/constants/Theme';
import CustomButton from '../../ui/CustomButton';

interface MatchDetailsFormProps {
  matchedUserName: string;
  matchedUserImage?: string;
  itemName: string;
  category: string;
  fromLocation: string;
  toLocation: string;
  onBack: () => void;
}
const MatchDetailsForm: React.FC<MatchDetailsFormProps> = ({
  matchedUserName,
  matchedUserImage,
  itemName,
  category,
  fromLocation,
  toLocation,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Match Details</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            {matchedUserImage ? (
              <Image source={{ uri: matchedUserImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {matchedUserName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{matchedUserName}</Text>
              <Text style={styles.userSubtitle}>{itemName}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Item Name :</Text>
                <Text style={styles.detailValue}>{itemName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category :</Text>
                <Text style={styles.detailValue}>{category}</Text>
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
{/* TODO: Ensure the confirmed users are moved to accepted  */}
            <View style={styles.buttonRow}>
              <CustomButton
                title="Confirm"
                style={styles.actionButton}
                variant="primary"
              />
              <CustomButton
                title="Decline"
                style={styles.actionButton}
                variant="primary"
              />
            </View>


          </View>
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
  marginTop: Theme.spacing.md,
},
actionButton: {
  flex: 1,                          
},
});

export default MatchDetailsForm;