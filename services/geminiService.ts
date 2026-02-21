import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TranslationBlock } from '../types';

// Helper to get an initialized AI instance
const getAiClient = (customApiKey?: string) => {
    const apiKey = customApiKey || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : undefined);
    if (!apiKey) {
        throw new Error("APIキーが設定されていません。設定画面からGemini APIキーを入力してください。");
    }
    return new GoogleGenAI({ apiKey });
};

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            japaneseText: {
                type: Type.STRING,
                description: "The original Japanese text found in the image.",
            },
            englishText: {
                type: Type.STRING,
                description: "The English translation of the Japanese text.",
            },
            boundingBox: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER, description: "The x-coordinate of the top-left corner as a percentage (0.0 to 1.0)." },
                    y: { type: Type.NUMBER, description: "The y-coordinate of the top-left corner as a percentage (0.0 to 1.0)." },
                    width: { type: Type.NUMBER, description: "The width of the text block as a percentage (0.0 to 1.0)." },
                    height: { type: Type.NUMBER, description: "The height of the text block as a percentage (0.0 to 1.0)." },
                },
                required: ["x", "y", "width", "height"],
            },
        },
        required: ["japaneseText", "englishText", "boundingBox"],
    },
};

export const translateImageText = async (base64Image: string, mimeType: string, customApiKey?: string): Promise<TranslationBlock[]> => {
    try {
        const ai = getAiClient(customApiKey);

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: `
                You are an expert OCR and translation tool. Analyze the provided image to identify all Japanese text blocks. 
                For each text block, provide the following information in a JSON array format:
                1. The original Japanese text.
                2. A high-quality English translation of that text.
                3. A precise bounding box for the text block, with x, y, width, and height values represented as decimals between 0 and 1, 
                   corresponding to their percentage position and size relative to the image's total dimensions.
                
                For example, a bounding box with "x": 0.1 means the text starts 10% from the left edge of the image.
                If no Japanese text is found, return an empty array.
            `
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as TranslationBlock[];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("画像の翻訳に失敗しました。API呼び出しでエラーが発生しました。");
    }
};

export const generateImageSummary = async (base64Image: string, mimeType: string, customApiKey?: string): Promise<string> => {
    try {
        const ai = getAiClient(customApiKey);

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: `
                この画像の内容を簡潔に要約してください。ファイル名として使用するため、以下の条件を満たしてください：
                - 20文字以内
                - 日本語で記述
                - ファイル名に使用できない文字（/\\:*?"<>|）は使用しない
                - 画像の主要な内容や特徴を表現する
                
                例：「商品カタログ」「レシピ手順」「地図案内」など
            `
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating image summary:", error);
        return "翻訳済み画像";
    }
};