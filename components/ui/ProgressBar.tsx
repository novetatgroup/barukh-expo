import React from "react";
import { View, Text, StyleSheet } from "react-native";

type ProgressBarProps = {
    step: number;
    labels: string[];
};

const ProgressBar: React.FC<ProgressBarProps> = ({ step, labels }) => {
    return (
        <View style={styles.container}>
            {labels.map((label, index) => {
                const currentStep = index + 1;
                const isActive = currentStep <= step;
                return (
                    <View key={index} style={styles.stepContainer}>
                        <View
                            style={[
                                styles.circle,
                                isActive ? styles.activeCircle : styles.inactiveCircle,
                            ]}
                        >
                            <Text style={isActive ? styles.activeText : styles.inactiveText}>
                                {currentStep}
                            </Text>
                        </View>

                        {index < labels.length - 1 && (
                            <View style={styles.dotContainer}>
                                {[...Array(8)].map((_, dotIndex) => (
                                    <View
                                        key={dotIndex}
                                        style={[
                                            styles.dot,
                                            isActive ? styles.activeDot : styles.inactiveDot,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    activeCircle: {
        backgroundColor: "#32BF5B",
        borderColor: "#aaa",
    },
    inactiveCircle: {
        backgroundColor: "#E5E5EA",
        borderColor: "#fff",
    },
    activeText: {
        color: "#fff",
        fontWeight: "bold",
    },
    inactiveText: {
        color: "#aaa",
        fontWeight: "bold",
    },
    line: {
        width: 40,
        height: 2,
        marginHorizontal: 5,
    },
    dotContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 6,
    },
    dot: {
        width: 10,
        height: 3,
        borderRadius: 3,
        marginHorizontal: 2,
    },
    activeDot: {
        backgroundColor: "#aaa",
    },
    inactiveDot: {
        backgroundColor: "#ccc",
    },
});

export default ProgressBar;
