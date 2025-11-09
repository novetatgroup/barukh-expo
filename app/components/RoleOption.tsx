import Theme from "@/app/constants/Theme";
import { ArrowRightIcon } from "@/assets/svgs";
import React, { ComponentType } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";
import { Role } from "../constants/roles";

interface RoleOptionProps {
  title: string;
  subtitle: string;
  icon: ComponentType<SvgProps>;
  value: Role;
  selected: boolean;
  onPress: (role: Role) => void;
}

const RoleOption: React.FC<RoleOptionProps> = ({
  title,
  subtitle,
  icon: Icon,
  value,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={() => onPress(value)}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <View style={[styles.iconContainer, !selected && styles.iconCircle]}>
        <Icon stroke={selected ? Theme.colors.white : "#CDFF00"} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.selectedText]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, selected && styles.selectedSubtext]}>
          {subtitle}
        </Text>
      </View>
      <ArrowRightIcon
        width={24}
        height={24}
        stroke={selected ? Theme.colors.white : Theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    height: Theme.components.button.height + Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: Theme.colors.primary,
  },
  iconContainer: {
    marginRight: Theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#163330",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
  },
  selectedText: {
    color: Theme.colors.white,
  },
  selectedSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  arrow: {
    fontSize: 24,
    color: Theme.colors.primary,
    fontWeight: "300",
  },
});

export default RoleOption;
