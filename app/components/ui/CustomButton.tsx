import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import Theme from '../../constants/Theme'; 

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'google';
  textStyle?: object;
  showGoogleIcon?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  variant = 'primary', 
  style, 
  textStyle,
  showGoogleIcon = false,
  onPress, 
  disabled,
  ...props 
}) => {
  
  console.log('CustomButton rendered:', { 
    title, 
    variant, 
    disabled, 
    hasOnPress: !!onPress 
  });

  const handlePress = (event: any) => {
    console.log('CustomButton handlePress called!');
    if (onPress) {
      console.log('Calling onPress from CustomButton');
      onPress(event);
    } else {
      console.log('No onPress handler provided to CustomButton');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'google' && styles.google,
        style
      ]}
      onPress={handlePress}
      {...props}
    >
      {variant === 'google' && showGoogleIcon && (
        <View style={styles.googleIconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
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
    opacity: 0.5,
  },
  baseText: {
    fontSize: Theme.typography.body.fontSize,
    fontWeight: '600',
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
  disabledText: {
    opacity: 0.7,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
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