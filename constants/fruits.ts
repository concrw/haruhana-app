// 하루하나 과일 시스템 상수

export const FRUITS = {
  apple: {
    id: 'apple',
    name: '사과',
    emoji: '🍎',
    color: '#FF6B6B',
    countDown: [3, 2, 1],
    difficulty: 2,
    usage: '시작, 중요',
  },
  orange: {
    id: 'orange',
    name: '오렌지',
    emoji: '🍊',
    color: '#FFA94D',
    countDown: [4, 3, 2, 1],
    difficulty: 3,
    usage: '다음, 진행',
  },
  lemon: {
    id: 'lemon',
    name: '레몬',
    emoji: '🍋',
    color: '#FFD43B',
    countDown: [5, 4, 3, 2, 1],
    difficulty: 4,
    usage: '뒤로, 취소',
  },
  grape: {
    id: 'grape',
    name: '포도',
    emoji: '🍇',
    color: '#B197FC',
    countDown: [2, 1],
    difficulty: 1,
    usage: '보조',
  },
  greenApple: {
    id: 'greenApple',
    name: '청사과',
    emoji: '🍏',
    color: '#69DB7C',
    countDown: [4, 3, 2, 1],
    difficulty: 3,
    usage: '완료, 성공',
  },
  banana: {
    id: 'banana',
    name: '바나나',
    emoji: '🍌',
    color: '#FFE066',
    countDown: [3, 2, 1],
    difficulty: 2,
    usage: '보조',
  },
  kiwi: {
    id: 'kiwi',
    name: '키위',
    emoji: '🥝',
    color: '#8BC34A',
    countDown: [2, 1],
    difficulty: 1,
    usage: '보조',
  },
} as const;

// 썩은 과일 (No-Go 타겟)
export const ROTTEN_FRUITS = {
  rottenApple: {
    id: 'rottenApple',
    name: '썩은 사과',
    emoji: '🍎',
    color: '#8B4513',
    isRotten: true,
    baseType: 'apple',
  },
  rottenOrange: {
    id: 'rottenOrange',
    name: '썩은 오렌지',
    emoji: '🍊',
    color: '#8B4513',
    isRotten: true,
    baseType: 'orange',
  },
} as const;

// 과일 배열 (게임용)
export const FRUIT_TYPES = Object.keys(FRUITS) as FruitId[];

export type FruitId = keyof typeof FRUITS;
export type RottenFruitId = keyof typeof ROTTEN_FRUITS;
export type AllFruitId = FruitId | RottenFruitId;

export interface Fruit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  countDown: number[];
  difficulty: number;
  usage: string;
}

export interface RottenFruit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isRotten: boolean;
  baseType: FruitId;
}
