import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
}

const DEFAULT_OPTIONS: SpeechOptions = {
  language: 'ko-KR',
  pitch: 1.0,
  rate: 0.9, // Slightly slower for seniors
};

export const speak = async (
  text: string,
  options: SpeechOptions = {}
): Promise<void> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: mergedOptions.language,
      pitch: mergedOptions.pitch,
      rate: mergedOptions.rate,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
};

export const stop = (): void => {
  Speech.stop();
};

export const isSpeaking = async (): Promise<boolean> => {
  return Speech.isSpeakingAsync();
};

// TTS 헬퍼 함수들
export const speakGameInstruction = (gameType: string, difficulty: number) => {
  const instructions: Record<string, string> = {
    'go-nogo': `레벨 ${difficulty}의 고노고 게임을 시작합니다. 초록 과일이 나오면 탭하고, 빨간 과일은 무시하세요.`,
    nback: `레벨 ${difficulty}의 N백 게임을 시작합니다. ${difficulty}번 전에 나온 과일과 같으면 탭하세요.`,
    'task-switch': `레벨 ${difficulty}의 과제 전환 게임을 시작합니다. 지시에 따라 과일을 분류하세요.`,
  };

  return speak(instructions[gameType] || '게임을 시작합니다.');
};

export const speakRitualGuide = (stepText: string) => {
  return speak(stepText);
};

export const speakEncouragement = (message: string) => {
  return speak(message);
};

export const speakScore = (score: number, isCorrect: boolean) => {
  const message = isCorrect ? `정답입니다! ${score}점을 획득했습니다.` : '아쉽게도 틀렸습니다. 다시 해봐요!';
  return speak(message);
};
