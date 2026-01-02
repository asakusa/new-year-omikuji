
export enum Language {
  JP = 'ja',
  EN = 'en',
  CN = 'zh'
}

export enum FortuneType {
  DAIKICHI = 'DAIKICHI', // 大吉
  KICHI = 'KICHI',       // 吉
  CHUKICHI = 'CHUKICHI', // 中吉
  SHOKICHI = 'SHOKICHI', // 小吉
  SUEKICHI = 'SUEKICHI', // 末吉
  KYO = 'KYO'            // 凶
}

export interface FortuneSlipData {
  number: number;
  type: FortuneType;
  typeName: string;
  poem: string;
  interpretation: string;
  encouragement?: string; // Encouraging message for bad luck
  details: {
    wish: string;
    waitingPerson: string;
    lostItem: string;
    travel: string;
    business: string;
    health: string;
  };
}

export interface AppState {
  language: Language;
  step: 'intro' | 'shake' | 'reveal_stick' | 'reveal_number' | 'find_drawer' | 'show_slip';
  drawnNumber: number | null;
  drawnType: FortuneType | null;
  fortuneData: FortuneSlipData | null;
}
