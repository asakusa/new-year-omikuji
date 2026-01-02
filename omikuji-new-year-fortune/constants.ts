
import { Language, FortuneType } from './types';

export const UI_TEXT = {
  [Language.JP]: {
    title: '新年おみくじ',
    subtitle: '',
    shakeBtn: 'みくじ筒を振る',
    drawBtn: '棒を出す',
    findingDrawer: '引き出しを探してください：第 {n} 番',
    clickDrawer: '引き出しを開ける',
    backBtn: 'もう一度',
    loading: 'おみくじを準備中...',
    fortuneTypes: {
      [FortuneType.DAIKICHI]: '大吉',
      [FortuneType.KICHI]: '吉',
      [FortuneType.CHUKICHI]: '中吉',
      [FortuneType.SHOKICHI]: '小吉',
      [FortuneType.SUEKICHI]: '末吉',
      [FortuneType.KYO]: '凶',
    },
    fields: {
      wish: '願望',
      waitingPerson: '待人',
      lostItem: '失物',
      travel: '旅行',
      business: '商売',
      health: '病気'
    }
  },
  [Language.EN]: {
    title: 'New Year Omikuji',
    subtitle: '',
    shakeBtn: 'Shake the Box',
    drawBtn: 'Draw a Stick',
    findingDrawer: 'Find Drawer No. {n}',
    clickDrawer: 'Open Drawer',
    backBtn: 'Try Again',
    loading: 'Preparing your fortune...',
    fortuneTypes: {
      [FortuneType.DAIKICHI]: 'Great Blessing',
      [FortuneType.KICHI]: 'Blessing',
      [FortuneType.CHUKICHI]: 'Middle Blessing',
      [FortuneType.SHOKICHI]: 'Small Blessing',
      [FortuneType.SUEKICHI]: 'Future Blessing',
      [FortuneType.KYO]: 'Bad Luck',
    },
    fields: {
      wish: 'Wish',
      waitingPerson: 'Waiting Person',
      lostItem: 'Lost Item',
      travel: 'Travel',
      business: 'Business',
      health: 'Health'
    }
  },
  [Language.CN]: {
    title: '新年摇签筒',
    subtitle: '',
    shakeBtn: '摇动签筒',
    drawBtn: '拔出签棒',
    findingDrawer: '请寻找抽屉：第 {n} 番',
    clickDrawer: '打开抽屉',
    backBtn: '再抽一次',
    loading: '正在求签...',
    fortuneTypes: {
      [FortuneType.DAIKICHI]: '大吉',
      [FortuneType.KICHI]: '吉',
      [FortuneType.CHUKICHI]: '中吉',
      [FortuneType.SHOKICHI]: '小吉',
      [FortuneType.SUEKICHI]: '末吉',
      [FortuneType.KYO]: '凶',
    },
    fields: {
      wish: '愿望',
      waitingPerson: '待人',
      lostItem: '失物',
      travel: '旅行',
      business: '商売',
      health: '疾病'
    }
  }
};
