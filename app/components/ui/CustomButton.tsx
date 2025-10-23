import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Theme from '../../constants/Theme';


interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'google';
  textStyle?: object;
  showGoogleIcon?: boolean;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  variant = 'primary', 
  style, 
  textStyle,
  showGoogleIcon = false,
  onPress, 
  disabled,
  loading = false,
  ...props 
}) => {

  const handlePress = (event: any) => {
    if (!loading && onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1} 
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'google' && styles.google,
        disabled && !loading && styles.disabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : Theme.colors.primary}
        />
      ) : (
        <>
          {variant === 'google' && showGoogleIcon && (
            <>
            {/* <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View> */}
            <Image
            source={require("../../../assets/images/googleIcon.png")}
            style={styles.googleIconContainer}
          />
            </>
            
          )}
          <Text
            style={[
              styles.baseText,
              variant === 'primary' && styles.primaryText,
              variant === 'secondary' && styles.secondaryText,
              variant === 'google' && styles.googleText,
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: Theme.components.button.height,
  },
  primary: {
    backgroundColor: Theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  google: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.text.gray,
  },
  disabled: {
    opacity: 1.0,
  },
  baseText: {
    fontSize: Theme.typography.body.fontSize,
    fontWeight: '500',
    fontFamily: 'Inter-Regular'
  },
  primaryText: {
    color: Theme.colors.white,
  },
  secondaryText: {
    color: Theme.colors.primary,
  },
  googleText: {
    color: Theme.colors.text.dark,
    fontWeight: '500',
  },
  googleIconContainer: {
    // width: 20,
    // height: 20,
    //backgroundColor: '#4285F4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  googleIcon: {
    color: Theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomButton;
