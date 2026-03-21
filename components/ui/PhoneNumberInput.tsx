import Theme from "@/constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "\u{1F1E6}\u{1F1EB}" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "\u{1F1E6}\u{1F1F1}" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "\u{1F1E9}\u{1F1FF}" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "\u{1F1E6}\u{1F1F4}" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "\u{1F1E6}\u{1F1F7}" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "\u{1F1E6}\u{1F1FA}" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "\u{1F1E6}\u{1F1F9}" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "\u{1F1E7}\u{1F1ED}" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "\u{1F1E7}\u{1F1E9}" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "\u{1F1E7}\u{1F1EA}" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "\u{1F1E7}\u{1F1EF}" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "\u{1F1E7}\u{1F1F4}" },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "\u{1F1E7}\u{1F1FC}" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "\u{1F1E7}\u{1F1F7}" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "\u{1F1E7}\u{1F1EB}" },
  { name: "Burundi", code: "BI", dialCode: "+257", flag: "\u{1F1E7}\u{1F1EE}" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "\u{1F1F0}\u{1F1ED}" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "\u{1F1E8}\u{1F1F2}" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "\u{1F1E8}\u{1F1E6}" },
  { name: "Chad", code: "TD", dialCode: "+235", flag: "\u{1F1F9}\u{1F1E9}" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "\u{1F1E8}\u{1F1F1}" },
  { name: "China", code: "CN", dialCode: "+86", flag: "\u{1F1E8}\u{1F1F3}" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "\u{1F1E8}\u{1F1F4}" },
  { name: "Congo (DRC)", code: "CD", dialCode: "+243", flag: "\u{1F1E8}\u{1F1E9}" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "\u{1F1E8}\u{1F1F7}" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "\u{1F1ED}\u{1F1F7}" },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "\u{1F1E8}\u{1F1FA}" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "\u{1F1E8}\u{1F1FF}" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "\u{1F1E9}\u{1F1F0}" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "\u{1F1EA}\u{1F1E8}" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "\u{1F1EA}\u{1F1EC}" },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "\u{1F1F8}\u{1F1FB}" },
  { name: "Eritrea", code: "ER", dialCode: "+291", flag: "\u{1F1EA}\u{1F1F7}" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "\u{1F1EA}\u{1F1F9}" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "\u{1F1EB}\u{1F1EE}" },
  { name: "France", code: "FR", dialCode: "+33", flag: "\u{1F1EB}\u{1F1F7}" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "\u{1F1E9}\u{1F1EA}" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "\u{1F1EC}\u{1F1ED}" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "\u{1F1EC}\u{1F1F7}" },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "\u{1F1EC}\u{1F1F9}" },
  { name: "Guinea", code: "GN", dialCode: "+224", flag: "\u{1F1EC}\u{1F1F3}" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "\u{1F1ED}\u{1F1F3}" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "\u{1F1ED}\u{1F1F0}" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "\u{1F1ED}\u{1F1FA}" },
  { name: "India", code: "IN", dialCode: "+91", flag: "\u{1F1EE}\u{1F1F3}" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "\u{1F1EE}\u{1F1E9}" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "\u{1F1EE}\u{1F1F7}" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "\u{1F1EE}\u{1F1F6}" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "\u{1F1EE}\u{1F1EA}" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "\u{1F1EE}\u{1F1F1}" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "\u{1F1EE}\u{1F1F9}" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "\u{1F1E8}\u{1F1EE}" },
  { name: "Jamaica", code: "JM", dialCode: "+1876", flag: "\u{1F1EF}\u{1F1F2}" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "\u{1F1EF}\u{1F1F5}" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "\u{1F1EF}\u{1F1F4}" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "\u{1F1F0}\u{1F1EA}" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "\u{1F1F0}\u{1F1FC}" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "\u{1F1F1}\u{1F1E7}" },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "\u{1F1F1}\u{1F1FE}" },
  { name: "Madagascar", code: "MG", dialCode: "+261", flag: "\u{1F1F2}\u{1F1EC}" },
  { name: "Malawi", code: "MW", dialCode: "+265", flag: "\u{1F1F2}\u{1F1FC}" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "\u{1F1F2}\u{1F1FE}" },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "\u{1F1F2}\u{1F1F1}" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "\u{1F1F2}\u{1F1FD}" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "\u{1F1F2}\u{1F1E6}" },
  { name: "Mozambique", code: "MZ", dialCode: "+258", flag: "\u{1F1F2}\u{1F1FF}" },
  { name: "Myanmar", code: "MM", dialCode: "+95", flag: "\u{1F1F2}\u{1F1F2}" },
  { name: "Namibia", code: "NA", dialCode: "+264", flag: "\u{1F1F3}\u{1F1E6}" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "\u{1F1F3}\u{1F1F5}" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "\u{1F1F3}\u{1F1F1}" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "\u{1F1F3}\u{1F1FF}" },
  { name: "Nicaragua", code: "NI", dialCode: "+505", flag: "\u{1F1F3}\u{1F1EE}" },
  { name: "Niger", code: "NE", dialCode: "+227", flag: "\u{1F1F3}\u{1F1EA}" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "\u{1F1F3}\u{1F1EC}" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "\u{1F1F3}\u{1F1F4}" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "\u{1F1F4}\u{1F1F2}" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "\u{1F1F5}\u{1F1F0}" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "\u{1F1F5}\u{1F1E6}" },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "\u{1F1F5}\u{1F1FE}" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "\u{1F1F5}\u{1F1EA}" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "\u{1F1F5}\u{1F1ED}" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "\u{1F1F5}\u{1F1F1}" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "\u{1F1F5}\u{1F1F9}" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "\u{1F1F6}\u{1F1E6}" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "\u{1F1F7}\u{1F1F4}" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "\u{1F1F7}\u{1F1FA}" },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "\u{1F1F7}\u{1F1FC}" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "\u{1F1F8}\u{1F1E6}" },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "\u{1F1F8}\u{1F1F3}" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "\u{1F1F7}\u{1F1F8}" },
  { name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "\u{1F1F8}\u{1F1F1}" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "\u{1F1F8}\u{1F1EC}" },
  { name: "Somalia", code: "SO", dialCode: "+252", flag: "\u{1F1F8}\u{1F1F4}" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "\u{1F1FF}\u{1F1E6}" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "\u{1F1F0}\u{1F1F7}" },
  { name: "South Sudan", code: "SS", dialCode: "+211", flag: "\u{1F1F8}\u{1F1F8}" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "\u{1F1EA}\u{1F1F8}" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "\u{1F1F1}\u{1F1F0}" },
  { name: "Sudan", code: "SD", dialCode: "+249", flag: "\u{1F1F8}\u{1F1E9}" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "\u{1F1F8}\u{1F1EA}" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "\u{1F1E8}\u{1F1ED}" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "\u{1F1F9}\u{1F1FC}" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "\u{1F1F9}\u{1F1FF}" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "\u{1F1F9}\u{1F1ED}" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "\u{1F1F9}\u{1F1EC}" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "\u{1F1F9}\u{1F1F3}" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "\u{1F1F9}\u{1F1F7}" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "\u{1F1FA}\u{1F1EC}" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "\u{1F1FA}\u{1F1E6}" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "\u{1F1E6}\u{1F1EA}" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "\u{1F1EC}\u{1F1E7}" },
  { name: "United States", code: "US", dialCode: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "\u{1F1FA}\u{1F1FE}" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "\u{1F1FB}\u{1F1EA}" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "\u{1F1FB}\u{1F1F3}" },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "\u{1F1FE}\u{1F1EA}" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "\u{1F1FF}\u{1F1F2}" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "\u{1F1FF}\u{1F1FC}" },
];

const DEFAULT_COUNTRY: Country = COUNTRIES.find(c => c.code === "US") || COUNTRIES[0];

const MAX_PHONE_LENGTH = 15;

interface PhoneNumberInputProps {
  value: string;
  onChangePhoneNumber: (phoneNumber: string) => void;
  selectedCountry: Country;
  onChangeCountry: (country: Country) => void;
  placeholder?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChangePhoneNumber,
  selectedCountry,
  onChangeCountry,
  placeholder = "Phone number",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    const lower = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.dialCode.includes(search) ||
        c.code.toLowerCase().includes(lower)
    );
  }, [search]);

  const handleSelectCountry = (country: Country) => {
    onChangeCountry(country);
    setModalVisible(false);
    setSearch("");
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    const dialDigits = selectedCountry.dialCode.replace("+", "");
    if (digitsOnly.startsWith(dialDigits) && digitsOnly.length > dialDigits.length) {
      onChangePhoneNumber(digitsOnly.slice(dialDigits.length));
      return;
    }
    onChangePhoneNumber(digitsOnly);
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Ionicons name="chevron-down" size={16} color={Theme.colors.text.gray} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
        <TextInput
          style={styles.phoneInput}
          value={value}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.text.lightGray}
          keyboardType="phone-pad"
          maxLength={MAX_PHONE_LENGTH}
        />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          setSearch("");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearch("");
              }}
            >
              <Ionicons name="close" size={24} color={Theme.colors.text.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={Theme.colors.text.gray}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search country"
              placeholderTextColor={Theme.colors.text.lightGray}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryRow,
                  item.code === selectedCountry.code && styles.countryRowSelected,
                ]}
                onPress={() => handleSelectCountry(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                {item.code === selectedCountry.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    height: 48,
    paddingHorizontal: 12,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  flag: {
    fontSize: 22,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Theme.colors.text.border,
    marginRight: 10,
  },
  dialCode: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
    height: "100%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.colors.text.dark,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.text.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.border,
  },
  countryRowSelected: {
    backgroundColor: Theme.colors.background.secondary,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.dark,
  },
  countryDialCode: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Theme.colors.text.gray,
    marginRight: 8,
  },
  checkIcon: {
    marginLeft: 4,
  },
});

export { COUNTRIES, DEFAULT_COUNTRY };
export default PhoneNumberInput;
