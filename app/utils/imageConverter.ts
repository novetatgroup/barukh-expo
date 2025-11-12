import { File } from "expo-file-system";

type ImageconverterProps = {
  imageUri: string;
};

export const convertImageUriToBase64 = async ({ imageUri }: ImageconverterProps): Promise<string | null> => {
  try {
    const file = new File(imageUri);

    const base64code: string = await file.base64();

    return `data:image/jpeg;base64,${base64code}`;
  } catch (error) {
    console.error("Error converting image to Base64 with modern API:", error);
    return null;
  }
};

