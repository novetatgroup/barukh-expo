// File: components/ui/ToastConfig.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import Theme from '../../constants/Theme'; // Adjust path to your theme

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Theme.colors.primary || '#4CAF50',
        backgroundColor: '#4CAF50',
        borderLeftWidth: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        marginHorizontal: 20,
        height: 80,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: Theme.colors.text?.dark || '#ffffff',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 14,
        color: Theme.colors.text?.gray || '#666666',
        fontWeight: '400',
        lineHeight: 18,
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FF4444',
        backgroundColor: '#ff4444',
        borderLeftWidth: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        marginHorizontal: 20,
        height: 80,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '400',
        lineHeight: 18,
      }}
    />
  ),

  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Theme.colors.primary || '#2196F3',
        backgroundColor: '#ffffff',
        borderLeftWidth: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        marginHorizontal: 20,
        height: 80,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        flex: 1,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: Theme.colors.text?.dark || '#333333',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 14,
        color: Theme.colors.text?.gray || '#666666',
        fontWeight: '400',
        lineHeight: 18,
      }}
    />
  ),

  customSuccess: ({ text1, text2 }: any) => (
    <View style={styles.customToast}>
      <View style={styles.customSuccessContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.customText1}>{text1}</Text>
          <Text style={styles.customText2}>{text2}</Text>
        </View>
      </View>
    </View>
  ),

  customError: ({ text1, text2 }: any) => (
    <View style={styles.customToast}>
      <View style={styles.customErrorContainer}>
        <View style={[styles.iconContainer, styles.errorIconContainer]}>
          <Text style={styles.errorIcon}>✕</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.customText1}>{text1}</Text>
          <Text style={styles.customText2}>{text2}</Text>
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  customToast: {
    height: 80,
    width: '90%',
    marginHorizontal: 20,
  },
  customSuccessContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: Theme.colors.primary || '#4CAF50',
  },
  customErrorContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#FF4444',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary || '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorIconContainer: {
    backgroundColor: '#FF4444',
  },
  successIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  customText1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text?.dark || '#333333',
    marginBottom: 4,
  },
  customText2: {
    fontSize: 14,
    color: Theme.colors.text?.gray || '#666666',
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default toastConfig;