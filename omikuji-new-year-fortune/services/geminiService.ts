import { Language, FortuneType, FortuneSlipData } from "../types";

// 缓存前缀
const CACHE_PREFIX = "omikuji_cache_";

async function fetchFortuneFromServer(
  number: number,
  type: FortuneType,
  lang: Language
): Promise<FortuneSlipData> {
  const res = await fetch("/.netlify/functions/fortune", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, type, lang }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Server error");
  }

  return data;
}

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
      console.log("Using cached fortune data for:", cacheKey);
      return JSON.parse(cachedData);
    } catch (e) {
      console.error("Failed to parse cached data", e);
    }
  }

  try {
    const result = await fetchFortuneFromServer(number, type, lang);

    // 3. 将结果存入缓存
    localStorage.setItem(cacheKey, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // 降级处理（保留你原来的降级内容）
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
        health: "Maintain balance and you will recover.",
      },
    };
  }
}
