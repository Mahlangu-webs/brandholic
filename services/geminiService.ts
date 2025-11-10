import { GoogleGenAI, Modality } from "@google/genai";
import type { ProductType } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Extracts a detailed description of a design from one or more images.
 */
export const extractDescription = async (
  images: Array<{ base64: string; mimeType: string }>,
  productType: ProductType
): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const singleImagePrompt = `Analyze the following image of a ${productType}. Isolate the primary logo or design on it. Describe the design in extensive detail, covering all elements, shapes, colors (with hex codes if possible), text, fonts, and the overall style. The description should be clear and precise enough for a graphic designer to recreate the design accurately. Do not describe the ${productType} itself, only the artwork on it.`;
  const multiImagePrompt = `Analyze the following images, which show a single ${productType} from multiple angles. Synthesize the different views to create ONE single, cohesive, and comprehensive description of the entire design that wraps around the item. Describe the full design in extensive detail, covering all elements, shapes, colors (with hex codes if possible), text, fonts, and the overall style. The description should be clear and precise enough for a graphic designer to recreate the complete design. Do not describe the ${productType} itself, only the artwork on it.`;

  const prompt = images.length > 1 ? multiImagePrompt : singleImagePrompt;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType,
    },
  }));

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...imageParts, textPart] },
  });

  return response.text;
};

/**
 * Recreates a design as a new image based on a textual description.
 */
export const recreateDesign = async (description: string): Promise<string> => {
  const model = 'imagen-4.0-generate-001';
  const prompt = `A high-resolution, clean graphic design suitable for printing on merchandise. The design should be on a solid white background for easy isolation. The design must accurately match the following description: "${description}"`;

  const response = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  } else {
    throw new Error("Image generation failed or returned no images.");
  }
};

/**
 * Extracts the original design from an image, removing the background.
 */
export const extractOriginalDesign = async (
  images: Array<{ base64: string; mimeType: string }>,
  productType: ProductType
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const prompt = `From the attached image(s) of a ${productType}, precisely isolate the main design or logo. Remove the background entirely, leaving only the design itself. The output image must have a transparent background. Do not add any extra elements or text. Just return the isolated design.`;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType,
    },
  }));

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...imageParts, textPart] },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Image extraction failed or returned no image data.");
};