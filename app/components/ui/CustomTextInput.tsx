import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import Theme from '@/app/constants/Theme';

interface CustomTextInputProps extends TextInputProps {
  variant?: 'default' | 'rounded' | 'compact';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  style, 
  variant = 'rounded',
  placeholderTextColor = "#999",
  ...props 
}) => {
  return (
    <TextInput
      style={[
        styles.base,
        variant === 'rounded' && styles.rounded,
        variant === 'compact' && styles.compact,
        style
      ]}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: 8,       
    paddingHorizontal: 10,
    paddingVertical: 8,    
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: Theme.colors.text.dark,
  },
  rounded: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  compact: {
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,

  },
});

export default CustomTextInput;
