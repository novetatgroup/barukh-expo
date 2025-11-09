import { StyleSheet } from "react-native";

const OnboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#163330",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 35,
    fontFamily: "Inter-Regular",
    color: "white",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: "#C0C0C0",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#CDFF00",
    width: 60, // ADDED: Make active dot longer
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  nextButton: {
    backgroundColor: "#CDFF00",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 15,
  },
  nextButtonText: {
    color: "#0A5D52",
    fontFamily: "Inter-Bold",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1, // ADDED: White border
    borderColor: "#FFFFFF", // ADDED: White border
  },
  skipButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
});

export default OnboardingStyles;
