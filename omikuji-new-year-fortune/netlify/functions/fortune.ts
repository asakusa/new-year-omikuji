import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Server API key missing" }),
    };
  }

  const { number, type, lang } = JSON.parse(event.body || "{}");
  if (typeof number !== "number" || !type || !lang) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Missing number/type/lang" }),
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const systemInstruction = `You are a Japanese priest specialized in traditional Omikuji. 
Each fortune must include:
1. A short 5-character x 4 lines poem (Kanshi).
2. A spiritual interpretation of the poem.
3. Specific advice for Wish, Waiting Person, Lost Item, Travel, Business, and Health.

SPECIAL RULE FOR 'KYO' (BAD LUCK):
If the fortune level is 'KYO', you MUST include an 'encouragement' field.

The tone should be traditional, encouraging, and slightly mystical.

OUTPUT LANGUAGE (STRICT):
- If lang is "ja", output MUST be 100% Japanese.
- If lang is "zh", output MUST be 100% Simplified Chinese.
- If lang is "en", output MUST be 100% English.
- Do NOT mix languages.

lang=${lang}
Number=${number}
FortuneLevel=${type}`;

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
      contents: `Generate a traditional Omikuji slip in lang=${lang}. Do not use any other language.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text =
      (response as any)?.text ??
      (response as any)?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text || "")
        .join("");

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    const data = JSON.parse(text);

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
