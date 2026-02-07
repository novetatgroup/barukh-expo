import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import Theme from "@/app/constants/Theme";
import { LocationData } from "../forms/traveller/packageForm/types";

export interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  value: LocationData | null;
  onLocationSelect: (location: LocationData | null) => void;
  error?: string;
  disabled?: boolean;
}

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

interface AutocompleteSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  placeholder = "Search for a city...",
  value,
  onLocationSelect,
  error,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value?.description || "");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value?.description) {
      setInputValue(value.description);
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  const fetchAutocomplete = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_API_KEY,
          },
          body: JSON.stringify({
            input,
            includedPrimaryTypes: ["locality", "administrative_area_level_1", "administrative_area_level_2"],
            languageCode: "en",
          }),
        }
      );

      const data = await response.json();

      if (data.suggestions) {
        const formattedSuggestions: AutocompleteSuggestion[] = data.suggestions
          .filter((s: any) => s.placePrediction)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            mainText: s.placePrediction.structuredFormat?.mainText?.text || "",
            secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || "",
            fullText: s.placePrediction.text?.text || "",
          }));
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.log("Autocomplete Error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlaceDetails = async (placeId: string, description: string): Promise<LocationData | null> => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            "X-Goog-FieldMask": "location,addressComponents",
          },
        }
      );

      const data = await response.json();

      if (data.location) {
        const addressComponents = data.addressComponents || [];

        const cityComponent =
          addressComponents.find((c: any) => c.types.includes("locality")) ||
          addressComponents.find((c: any) => c.types.includes("administrative_area_level_1")) ||
          addressComponents.find((c: any) => c.types.includes("sublocality"));

        const countryComponent = addressComponents.find((c: any) =>
          c.types.includes("country")
        );

        return {
          placeId,
          description,
          city: cityComponent?.longText || "",
          country: countryComponent?.longText || "",
          countryCode: countryComponent?.shortText || "",
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
      }
      return null;
    } catch (err) {
      console.log("Place Details Error:", err);
      return null;
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchAutocomplete(text);
    }, 300);
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    setInputValue(suggestion.fullText);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();

    setIsLoading(true);
    const locationData = await fetchPlaceDetails(suggestion.placeId, suggestion.fullText);
    setIsLoading(false);

    if (locationData) {
      onLocationSelect(locationData);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const renderSuggestion = ({ item }: { item: AutocompleteSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionRow}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.mainText}>{item.mainText}</Text>
      {item.secondaryText && (
        <Text style={styles.secondaryText}>{item.secondaryText}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            error && styles.textInputError,
            disabled && styles.textInputDisabled,
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.text.lightGray}
          editable={!disabled}
        />
        {isLoading && (
          <ActivityIndicator
            style={styles.loader}
            size="small"
            color={Theme.colors.primary}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            renderItem={renderSuggestion}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xs,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  inputContainer: {
    position: "relative",
  },
  textInput: {
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.body.fontSize,
    color: Theme.colors.text.dark,
    minHeight: Theme.components.button.height,
  },
  textInputError: {
    borderColor: Theme.colors.error,
  },
  textInputDisabled: {
    backgroundColor: Theme.colors.background.secondary,
    opacity: 0.6,
  },
  loader: {
    position: "absolute",
    right: Theme.spacing.md,
    top: "50%",
    marginTop: -10,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    maxHeight: 200,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionRow: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
  },
  mainText: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.text.dark,
  },
  secondaryText: {
    fontSize: 12,
    color: Theme.colors.text.gray,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.background.border,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error,
    marginTop: 4,
    marginLeft: Theme.spacing.xs,
  },
});

export default LocationPicker;
