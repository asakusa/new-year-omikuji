
import { GoogleGenAI, Type } from "@google/genai";
import { Language, FortuneType, FortuneSlipData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 缓存前缀
const CACHE_PREFIX = 'omikuji_cache_';

export async function generateFortuneSlip(
  number: number,
  type: FortuneType,
  lang: Language
): Promise<FortuneSlipData> {
  // 1. 生成唯一的缓存键名 (例如: omikuji_cache_ja_8_DAIKICHI)
  const cacheKey = `${CACHE_PREFIX}${lang}_${number}_${type}`;
  
  // 2. 检查本地存储是否有缓存
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      console.log('Using cached fortune data for:', cacheKey);
      return JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached data', e);
    }
  }

  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a Japanese priest specialized in traditional Omikuji. 
  Each fortune must include:
  1. A short 5-character x 4 lines poem (Kanshi).
  2. A spiritual interpretation of the poem.
  3. Specific advice for Wish, Waiting Person, Lost Item, Travel, Business, and Health.
  
  SPECIAL RULE FOR 'KYO' (BAD LUCK):
  If the fortune level is 'KYO', you MUST include an 'encouragement' field. 
  This message should be poetic and deeply encouraging, reminding the person that destiny is in their own hands and that bad luck is just a temporary shadow that can be transformed by strong will and virtuous action. 

  The tone should be traditional, encouraging, and slightly mystical.
  Language of output: ${lang}.
  Number: ${number}. Fortune Level: ${type}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      poem: { type: Type.STRING },
      typeName: { type: Type.STRING },
      interpretation: { type: Type.STRING },
      encouragement: { type: Type.STRING, description: "Only required for KYO fortunes." },
      details: {
        type: Type.OBJECT,
        properties: {
          wish: { type: Type.STRING },
          waitingPerson: { type: Type.STRING },
          lostItem: { type: Type.STRING },
          travel: { type: Type.STRING },
          business: { type: Type.STRING },
          health: { type: Type.STRING }
        },
        required: ["wish", "waitingPerson", "lostItem", "travel", "business", "health"]
      }
    },
    required: ["poem", "typeName", "interpretation", "details"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a traditional Omikuji slip for number ${number} with fortune type ${type} in ${lang}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    const result = {
      ...data,
      number,
      type
    };

    // 3. 将结果存入缓存
    localStorage.setItem(cacheKey, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // 降级处理
    return {
      number,
      type,
      typeName: type,
      poem: "Spring breeze blows gently,\nFortune arrives today.\nHeart is pure and clear,\nBright path leads the way.",
      interpretation: "Success follows patience and virtuous action.",
      details: {
        wish: "Will come true if you persist.",
        waitingPerson: "Will appear soon.",
        lostItem: "Can be found in a high place.",
        travel: "A good journey awaits.",
        business: "Profitable season ahead.",
        health: "Maintain balance and you will recover."
      }
    };
  }
}
