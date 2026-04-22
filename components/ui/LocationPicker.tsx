import Theme from "@/constants/Theme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LocationData } from "../forms/traveller/packageForm/types";

export interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  value: LocationData | null;
  onLocationSelect: (location: LocationData | null) => void;
  onInputChange?: (text: string) => void;
  zIndex?: number;
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
  onInputChange,
  zIndex = 1,
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
      const params = new URLSearchParams({
        input,
        types: "(regions)",
        language: "en",
        key: GOOGLE_API_KEY
      });

      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
        {
          method: "GET", headers: {
            "Content-Type": "application/json"
          },
        }
      );
      const { predictions = [], status, error_message } = (await response.json()) as {
        predictions?: any[];
        status?: string;
        error_message?: string;
      };

      if (!response.ok || (status && status !== "OK" && status !== "ZERO_RESULTS")) {
        throw new Error(error_message || status || "Autocomplete request failed");
      }

      if (predictions.length > 0) {
        const formattedSuggestions: AutocompleteSuggestion[] = predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          mainText: prediction.structured_formatting?.main_text || "",
          secondaryText: prediction.structured_formatting?.secondary_text || "",
          fullText: prediction.description || "",
        }));
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Autocomplete Error:", err);
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

  const buildFallbackLocation = (suggestion: AutocompleteSuggestion): LocationData => {
    const locationParts = suggestion.fullText.split(",").map((part) => part.trim()).filter(Boolean);
    const city = suggestion.mainText || locationParts[0] || suggestion.fullText;
    const country = locationParts[locationParts.length - 1] || suggestion.secondaryText || "";

    return {
      placeId: suggestion.placeId,
      description: suggestion.fullText,
      city,
      country,
      countryCode: country,
      latitude: 0,
      longitude: 0,
    };
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setShowSuggestions(true);
    onInputChange?.(text);

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

    onLocationSelect(locationData ?? buildFallbackLocation(suggestion));
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
    <View
      style={[
        styles.container,
        {
          zIndex,
          ...Platform.select({
            android: {
              elevation: zIndex,
            },
          }),
        },
      ]}
    >
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
        <View style={[styles.suggestionsContainer, { zIndex }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item, index) => (
              <React.Fragment key={item.placeId}>
                {index > 0 && <View style={styles.separator} />}
                {renderSuggestion({ item })}
              </React.Fragment>
            ))}
          </ScrollView>
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
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.body.fontSize,
    color: Theme.colors.text.dark,
    height: 48,
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
