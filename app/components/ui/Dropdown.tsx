import Theme from "@/app/constants/Theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type DropdownOption = {
  label: string;
  value: string;
} | string;


export interface CustomDropdownProps {
  label?: string;
  value?: string | string[];
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  dropdownStyle?: ViewStyle | ViewStyle[];
  labelStyle?: TextStyle | TextStyle[];
  textStyle?: TextStyle | TextStyle[];
  errorStyle?: TextStyle | TextStyle[];
  showLabel?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = " ",
  error,
  disabled = false,
  containerStyle,
  dropdownStyle,
  labelStyle,
  textStyle,
  errorStyle,
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const getLabel = (option: DropdownOption): string => {
    return typeof option === 'string' ? option : option.label;
  };

  const getValue = (option: DropdownOption): string => {
    return typeof option === 'string' ? option : option.value;
  };

  const getDisplayLabel = (): string => {
    if (!value) return placeholder;
    const currentValue = Array.isArray(value) ? value[0] : value;
    const option = options.find(opt => getValue(opt) === currentValue);
    return option ? getLabel(option) : currentValue || placeholder;
  };


  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    const selectedValue = getValue(option);
    onSelect(selectedValue);
    setIsOpen(false);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
          dropdownStyle,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {getDisplayLabel()}
        </Text>

        <Animated.Text style={[styles.dropdownIcon, { transform: [{ rotate }] }]}>
          ›
        </Animated.Text>
      </TouchableOpacity>

      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.centeredBox}>
            <View
              style={[
                styles.modalContent,
                { maxHeight: Math.min(options.length, 5) * 48 + Theme.spacing.sm * 2 },
              ]}
            >
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
                {options.map((option, index) => {
                  const optionValue = getValue(option);
                  const optionLabel = getLabel(option);
                  const isSelected = value === optionValue;

                  return (
                    <TouchableOpacity
                      key={`${optionValue}-${index}`}
                      style={[styles.option, isSelected && styles.selectedOption]}
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                        {optionLabel}
                      </Text>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.caption,
    color: Theme.colors.text.gray,
    marginBottom: Theme.spacing.xs,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: Theme.components.button.height,
  },
  dropdownError: {
    borderColor: Theme.colors.error,
  },
  dropdownDisabled: {
    backgroundColor: Theme.colors.background.secondary,
    opacity: 0.6,
  },
  dropdownText: {
    ...Theme.typography.body,
    color: Theme.colors.text.dark,
    flex: 1,
  },
  placeholderText: {
    color: Theme.colors.text.lightGray,
    fontSize: Theme.typography.body.fontSize,
  },
  disabledText: {
    color: Theme.colors.text.lightGray,
  },
  dropdownIcon: {
    fontSize: 14,
    color: Theme.colors.text.gray,
    marginLeft: Theme.spacing.xs,
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.error,
    marginTop: Theme.spacing.xs / 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredBox: {
    width: "80%",
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.md,
    overflow: "hidden",
  },
  optionsList: {
    paddingVertical: Theme.spacing.sm,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.border,
  },
  selectedOption: {
    backgroundColor: Theme.colors.background.secondary,
  },
  optionText: {
    ...Theme.typography.body,
    color: Theme.colors.text.dark,
  },
  selectedOptionText: {
    color: Theme.colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: "bold",
  },
});

export default CustomDropdown;
