
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Product } from "../types";

/**
 * Compresses an image data URL to ensure it fits within API limits and prevents RPC/XHR errors.
 */
const compressImage = async (dataUrl: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context failed"));
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getBase64Data = (dataUrl: string) => dataUrl.split(',')[1];

/**
 * Generates a virtual try-on image using strict identity and pose preservation constraints.
 */
export const generateVirtualTryOn = async (userImage: string, outfitImage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const compressedUser = await compressImage(userImage);
  const compressedOutfit = await compressImage(outfitImage);

  const prompt = `
    ### SYSTEM INSTRUCTION: VIRTUAL TRY-ON AGENT
    You are an expert computer vision model specializing in identity preservation and pose-constrained editing.
    
    ### TASK
    Generate a high-fidelity virtual try-on image.
    1. First Image: The User Portrait (Structural Reference)
    2. Second Image: The Target Garment (Texture & Style Reference)

    ### HARD CONSTRAINTS (MANDATORY)
    1. **Pose Preservation**: The body pose of the first image MUST remain exactly the same. Do not alter head orientation, shoulder angle, arm position, or posture.
    2. **Identity Preservation**: The person's face in the first image MUST remain unchanged. Preserve facial structure, expression, skin tone, and hairstyle exactly.
    3. **Structural Lock**: Only modify the clothing region. The body shape, background, and lighting environment must be maintained from the first image.

    ### CLOTHING MODIFICATION
    - Seamlessly fit the garment from the second image onto the person's body.
    - Respect natural fabric folds, draping, and physical occlusions.
    - Match the lighting of the garment to the lighting in the first image for realism.

    ### OUTPUT
    Produce a single, realistic, professional photograph.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: getBase64Data(compressedUser), mimeType: 'image/jpeg' } },
        { inlineData: { data: getBase64Data(compressedOutfit), mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
        imageConfig: {
            aspectRatio: "3:4"
        }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  throw new Error("Failed to generate image");
};

/**
 * Extracts products with a focus on IDENTICAL visual matches and similar styles from specified Indian platforms.
 */
export const extractProductsFromImage = async (generatedImageUrl: string, originalOutfitImage: string): Promise<Product[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const compressedGenerated = await compressImage(generatedImageUrl, 800);

  const prompt = `
    ### Role
    Product Procurement Intelligence for Indian Retail Markets.

    ### Task
    Analyze the clothing in the image and find listings on these specific platforms:
    - Max Fashion
    - Flipkart
    - Meesho
    - Amazon India
    - Savana
    - Nike India
    - Puma India
    - Myntra
    - Ajio
    - H&M India

    ### Requirements
    1. Identify the 'Exact Match' (the specific item seen).
    2. Identify 2-3 'Similar Styles' or 'Alternatives'.
    3. Prices must be in Indian Rupees (₹ INR).
    4. Platforms MUST be one of the listed above.

    Return a JSON array of objects with:
    - name: Product title.
    - price: Numerical value in INR.
    - platform: The specific platform name from the list.
    - category: e.g., "Casual Shirt", "Ethnic Wear", "Running Shoes".
    - buyLink: Use a direct search link for that platform if the exact SKU isn't known.
    - isExactMatch: Boolean.
    - isAlternative: Boolean.
    - confidence: 0-100.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: getBase64Data(compressedGenerated), mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            platform: { type: Type.STRING },
            category: { type: Type.STRING },
            buyLink: { type: Type.STRING },
            isExactMatch: { type: Type.BOOLEAN },
            isAlternative: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER }
          },
          required: ["name", "price", "platform", "category", "isExactMatch", "isAlternative", "confidence"]
        }
      }
    }
  });

  try {
    const rawJson = JSON.parse(response.text || "[]");
    return rawJson
      .filter((item: any) => item.confidence >= 65)
      .map((item: any, index: number) => {
        // Build a better search link if the AI provided a generic one
        let finalLink = item.buyLink;
        if (!finalLink || finalLink.includes('example.com')) {
          const searchQuery = encodeURIComponent(`${item.name} ${item.platform} India`);
          finalLink = `https://www.google.com/search?q=${searchQuery}`;
          
          // Try to make it platform-specific
          if (item.platform.toLowerCase().includes('myntra')) finalLink = `https://www.myntra.com/${item.name.replace(/\s+/g, '-')}`;
          if (item.platform.toLowerCase().includes('amazon')) finalLink = `https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`;
          if (item.platform.toLowerCase().includes('ajio')) finalLink = `https://www.ajio.com/search/?text=${encodeURIComponent(item.name)}`;
          if (item.platform.toLowerCase().includes('flipkart')) finalLink = `https://www.flipkart.com/search?q=${encodeURIComponent(item.name)}`;
        }

        return {
          ...item,
          id: `prod-${index}-${Date.now()}`,
          imageUrl: item.isExactMatch 
            ? originalOutfitImage 
            : `https://loremflickr.com/400/500/fashion,clothing,${encodeURIComponent(item.category)}/all?lock=${index + 300}`,
          buyLink: finalLink
        };
      });
  } catch (e) {
    console.error("Extraction Error", e);
    return [];
  }
};

/**
 * Provides conversational, multimodal, and explainable styling advice.
 */
export const getStylingAdvice = async (imageUrl: string, userMessage: string, history: any[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const compressed = await compressImage(imageUrl, 800);
  
  const systemInstruction = `
    You are "Aura", a sophisticated AI Style Concierge for the Indian market.
    
    ### BEHAVIOR RULES
    - **Conversational & Explainable**: Don't just list items. Explain the "Why". (e.g., "Since this outfit has a wide neckline and light colors, medium-length earrings balance the look without overpowering it.")
    - **Multimodal Analysis**: Explicitly reference the user's generated image (e.g., "From the drape of your sleeves...", "The vibrant red of this dress suggests...").
    - **No Overclaiming**: Use humble but confident phrasing ("Our analysis suggests...", "Visually, the silhouette appears...").
    - **Indian Context**: Prioritize ethnic and contemporary Indian fashion trends.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        {
            role: 'user',
            parts: [
                { inlineData: { data: getBase64Data(compressed), mimeType: 'image/jpeg' } },
                { text: userMessage }
            ]
        }
    ],
    config: { systemInstruction }
  });

  return response.text || "I'm looking at your new look! It's stunning. To balance the silhouette, I'd suggest a pair of statement silver jhumkas.";
};
