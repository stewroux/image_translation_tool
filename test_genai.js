import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';

// Try to load from .env.local
const envConfig = dotenv.config({ path: '.env.local' }).parsed;
const apiKey = envConfig?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("No API key found.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: 'A futuristic top banner image for a web application called "Image Japanese Translator". The app translates Japanese text in images to English. High quality, 4k, professional, clean layout, dark mode aesthetic with neon accents.',
        config: {
            numberOfImages: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg"
        }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64Image = response.generatedImages[0].image.imageBytes;
      fs.writeFileSync('output_test.jpg', Buffer.from(base64Image, 'base64'));
      console.log("Image generated successfully!");
    } else {
        console.log("No image returned.");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
