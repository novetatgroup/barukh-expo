import React, { useContext } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../ui/CustomButton";
import Theme from "@/app/constants/Theme";
import KYCContext from "@/app/context/KYCContext";

type DocumentCaptureFormProps = {
	isLoading: boolean;
	onTakePhoto: (side: "front" | "back") => void;
	onSubmit: () => void;
};

const DocumentCaptureForm: React.FC<DocumentCaptureFormProps> = ({
	isLoading,
	onTakePhoto,
	onSubmit,
}) => {
	const { frontImage, backImage } = useContext(KYCContext);

	const renderDocumentSection = (
		label: string,
		imageUri: string | null,
		side: "front" | "back"
	) => (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>{label}</Text>
			</View>

			<TouchableOpacity
				style={[
					styles.imageContainer,
					imageUri && styles.imageContainerFilled,
				]}
				onPress={() => onTakePhoto(side)}
				activeOpacity={0.7}
				disabled={isLoading}>
				{imageUri ? (
					<Image
						source={{ uri: imageUri }}
						style={styles.capturedImage}
						resizeMode="cover"
					/>
				) : (
					<View style={styles.placeholderContainer}>
						{isLoading ? (
							<ActivityIndicator
								size="large"
								color={Theme.colors.blue}
							/>
						) : (
							<>
								<Ionicons
									name="camera"
									size={48}
									color={Theme.colors.text.gray}
								/>
								<Text style={styles.placeholderText}>
									Tap to capture
								</Text>
								<Text style={styles.placeholderSubtext}>
									{side === "front"
										? "Front side of your ID"
										: "Back side of your ID"}
								</Text>
							</>
						)}
					</View>
				)}
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.verifyText}>Verify</Text>
				<Text style={styles.accountText}>Account</Text>
				<Text style={styles.subText}>
					Take a photo of your Document
				</Text>
			</View>

			<View style={styles.content}>
				{renderDocumentSection("Front Side", frontImage, "front")}
				{renderDocumentSection("Back Side", backImage, "back")}
			</View>

			<View style={styles.footer}>
				{frontImage && backImage ? (
					<CustomButton
						title="Submit Documents"
						variant="primary"
						style={styles.submitButton}
						onPress={onSubmit}
						disabled={isLoading}
					/>
				) : (
					<View style={styles.progressContainer}>
						<Text style={styles.progressText}>
							{!frontImage && !backImage
								? "Capture both sides to continue"
								: frontImage && !backImage
								? "Now capture the back side"
								: "Now capture the front side"}
						</Text>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{
										width: `${
											frontImage && backImage
												? 100
												: frontImage || backImage
												? 50
												: 0
										}%`,
									},
								]}
							/>
						</View>
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	verifyText: {
		...Theme.typography.h1,
		fontWeight: "500",
		textAlign: "center",
		color: Theme.colors.primary,
	},
	accountText: {
		...Theme.typography.h1,
		fontWeight: "700",
		textAlign: "center",
		color: Theme.colors.primary,
		marginBottom: Theme.spacing.md,
	},
	subText: {
		...Theme.typography.body,
		textAlign: "center",
		color: Theme.colors.primary,
		marginBottom: Theme.spacing.xs,
	},

	container: {
		flex: 1,
		backgroundColor: Theme.colors.background.primary,
	},
	header: {
		paddingHorizontal: Theme.screenPadding.horizontal,
		paddingTop: Theme.spacing.md,
		paddingBottom: Theme.spacing.xs,
		marginTop: Theme.spacing.lg + Theme.spacing.xs,
		backgroundColor: Theme.colors.background.primary,
		borderBottomColor: Theme.colors.background.border,
	},
	content: {
		flex: 1,
		paddingHorizontal: Theme.screenPadding.horizontal,
		paddingTop: Theme.screenPadding.horizontal,
	},

	section: {
		marginBottom: Theme.spacing.lg,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Theme.spacing.md,
	},
	sectionTitle: {
		...Theme.typography.h2,
		color: Theme.colors.text.dark,
		marginLeft: Theme.spacing.sm,
	},

	imageContainer: {
		width: "100%",
		height: Theme.components.imageContainer.height,
		borderWidth: Theme.components.imageContainer.borderWidth,
		borderColor: Theme.colors.text.border,
		borderRadius: Theme.components.imageContainer.borderRadius,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Theme.colors.background.secondary,
		borderStyle: "dashed",
		position: "relative",
	},
	imageContainerFilled: {
		borderColor: Theme.colors.success,
		borderStyle: "solid",
		backgroundColor: Theme.colors.background.primary,
	},
	capturedImage: {
		width: "100%",
		height: "100%",
		borderRadius: Theme.borderRadius.md - 2,
	},

	placeholderContainer: {
		alignItems: "center",
	},
	placeholderText: {
		fontSize: 18,
		fontWeight: "600",
		color: Theme.colors.text.gray,
		marginTop: Theme.spacing.sm + Theme.spacing.xs,
	},
	placeholderSubtext: {
		...Theme.typography.caption,
		color: Theme.colors.text.lightGray,
		marginTop: Theme.spacing.xs,
		textAlign: "center",
	},

	footer: {
		padding: Theme.screenPadding.horizontal,
		borderTopWidth: 1,
		borderTopColor: Theme.colors.background.border,
		backgroundColor: Theme.colors.background.primary,
	},
	submitButton: {
		height: Theme.components.button.height,
		borderRadius: Theme.borderRadius.sm + Theme.spacing.xs,
	},

	progressContainer: {
		alignItems: "center",
	},
	progressText: {
		...Theme.typography.body,
		color: Theme.colors.text.gray,
		marginBottom: Theme.spacing.sm + Theme.spacing.xs,
		textAlign: "center",
	},
	progressBar: {
		width: "100%",
		height: 6,
		backgroundColor: Theme.colors.background.border,
		borderRadius: Theme.borderRadius.xs - 1,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: Theme.colors.blue,
		borderRadius: Theme.borderRadius.xs - 1,
	},
});

export default DocumentCaptureForm;
