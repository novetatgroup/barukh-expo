import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  variant?: 'default' | 'rounded';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  style, 
  variant = 'default',
  placeholderTextColor = "#999",
  ...props 
}) => {
  return (
    <TextInput
      style={[
        styles.base,
        variant === 'rounded' && styles.rounded,
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
    borderColor: "#C0C0C0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  rounded: {
    borderRadius: 20,
  },
});

export default CustomTextInput;
