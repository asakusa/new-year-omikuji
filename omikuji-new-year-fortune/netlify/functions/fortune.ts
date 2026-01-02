// omikuji-new-year-fortune/netlify/functions/fortune.ts
import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server API key missing" }) };
  }

  const { number, type, lang } = JSON.parse(event.body || "{}");
  if (typeof number !== "number" || !type || !lang) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing number/type/lang" }) };
  }

  const model = "gemini-3-flash-preview";

  // ✅ 直接复制你现有 geminiService.ts 第 32~45 行
  const systemInstruction = `You are a Japanese priest specialized in traditional Omikuji. 
  Each fortune must include:
  1. A short 5-character x 4 lines poem (Kanshi).
  2. A spiritual interpretation of the poem.
  3. Specific advice for Wish, Waiting Person, Lost Item, Travel, Business, and Health.
  
  SPECIAL RULE FOR 'KYO' (BAD LUCK):
  If the fortune level is 'KYO', you MUST include an 'encouragement' field. 

  The tone should be traditional, encouraging, and slightly mystical.
  Language of output: ${lang}.
  Number: ${number}. Fortune Level: ${type}.`;

  // ✅ 直接复制你现有 geminiService.ts 第 46~67 行
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      poem: { type: Type.STRING },
      typeName: { type: Type.STRING },
      interpretation: { type: Type.STRING },
      encouragement: { type: Type.STRING },
      details: {
        type: Type.OBJECT,
        properties: {
          wish: { type: Type.STRING },
          waitingPerson: { type: Type.STRING },
          lostItem: { type: Type.STRING },
          travel: { type: Type.STRING },
          business: { type: Type.STRING },
          health: { type: Type.STRING },
        },
        required: ["wish", "waitingPerson", "lostItem", "travel", "business", "health"],
      },
    },
    required: ["poem", "typeName", "interpretation", "details"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a traditional Omikuji slip for number ${number} with fortune type ${type} in ${lang}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ...data, number, type }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Gemini failed", detail: String(e?.message || e) }),
    };
  }
};
