// app/(onboarding)/styles/OnboardingStyles.ts
import { StyleSheet } from "react-native";

const OnboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#163330",
  },
  slide: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 80,
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  logo: {
    width: 45,
    height: 45,
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    fontFamily: "inter",
    color: "white",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "inter",
    color: "#C0C0C0",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#CDFF00",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: "#CDFF00",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 15,
  },
  nextButtonText: {
    color: "#0A5D52",
    fontFamily: "inter",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 25,
  },
  skipButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "inter",
  },
});

export default OnboardingStyles;
