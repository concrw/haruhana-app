import { create } from 'zustand';
import {
  GameType,
  GameSession,
  GameState,
  GoNoGoMetrics,
  NBackMetrics,
  TaskSwitchMetrics,
  SortingRule,
} from '../types/game';
import { FruitId } from '../constants/fruits';
import { GAME_CONFIG } from '../constants/game';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

interface GameStoreState extends GameState {
  // Additional state
  totalFruits: number;
  gameHistory: GameSession[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTrial: (sessionId: string, trial: any) => void;
  addFruit: (fruitId: string, count?: number) => void;

  // Session management
  startSession: (gameType: GameType, difficulty: number) => string;
  endSession: (sessionId: string, results: { correct: number; incorrect: number; averageReactionTime: number; fruitsEarned: number }) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;

  // Game progress
  recordTrial: (
    isCorrect: boolean,
    reactionTime: number,
    additional?: {
      isGoTrial?: boolean;
      isTarget?: boolean;
      isSwitchTrial?: boolean;
    }
  ) => void;
  nextTrial: () => void;

  // Scoring
  addScore: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;

  // N-Back specific
  addToNBackHistory: (fruit: FruitId) => void;
  checkNBackMatch: (n: number) => boolean;

  // Task Switch specific
  setCurrentRule: (rule: SortingRule) => void;

  // Adaptive difficulty
  calculateAdaptiveDifficulty: () => number;
}

const initialGameState: GameState = {
  currentSession: null,
  currentTrial: 0,
  totalTrials: 30,
  currentDifficulty: 1,
  score: 0,
  streak: 0,
  isPlaying: false,
  isPaused: false,
  goNoGoMetrics: undefined,
  nBackMetrics: undefined,
  nBackHistory: [],
  taskSwitchMetrics: undefined,
  currentRule: undefined,
};

const initialGoNoGoMetrics: GoNoGoMetrics = {
  totalTrials: 0,
  goTrials: 0,
  noGoTrials: 0,
  correctGo: 0,
  correctNoGo: 0,
  commissionError: 0,
  omissionError: 0,
  reactionTimes: [],
};

const initialNBackMetrics: NBackMetrics = {
  totalTrials: 0,
  targets: 0,
  nonTargets: 0,
  hits: 0,
  correctRejections: 0,
  falseAlarms: 0,
  misses: 0,
  reactionTimes: [],
};

const initialTaskSwitchMetrics: TaskSwitchMetrics = {
  totalTrials: 0,
  switchTrials: 0,
  nonSwitchTrials: 0,
  correctSwitch: 0,
  correctNonSwitch: 0,
  switchCost: 0,
  reactionTimes: [],
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialGameState,
  totalFruits: 0,
  gameHistory: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Add trial to current session
  addTrial: (sessionId, trial) => {
    // Trial management is handled by recordTrial
    // Trials are stored in the session if needed
  },

  // Add fruit to collection
  addFruit: (fruitId, count = 1) => {
    set((state) => ({
      totalFruits: state.totalFruits + count,
    }));
  },

  // Start a new game session
  startSession: (gameType, difficulty) => {
    const sessionId = `session-${Date.now()}`;
    const config = GAME_CONFIG[gameType === 'go_nogo' || gameType === 'go-nogo' ? 'goNoGo' : gameType === 'nback' ? 'nBack' : 'taskSwitch'];
    const totalTrials = 'sessionTrials' in config ? config.sessionTrials : 30;

    // Get current user ID
    const authStore = require('./authStore').useAuthStore;
    const userId = authStore.getState().user?.id || '';

    const session: GameSession = {
      id: sessionId,
      userId,
      gameType,
      startedAt: new Date(),
      endedAt: null,
      difficultyLevel: difficulty,
      totalTrials: 0,
      correctResponses: 0,
      incorrectResponses: 0,
      accuracyRate: 0,
      difficultyAdjusted: false,
      score: 0,
      fruitsEarned: 0,
    };

    let metrics: Partial<GameStoreState> = {};

    switch (gameType) {
      case 'go_nogo':
      case 'go-nogo':
        metrics = { goNoGoMetrics: { ...initialGoNoGoMetrics } };
        break;
      case 'nback':
        metrics = {
          nBackMetrics: { ...initialNBackMetrics },
          nBackHistory: [],
        };
        break;
      case 'task_switch':
      case 'task-switch':
        metrics = {
          taskSwitchMetrics: { ...initialTaskSwitchMetrics },
          currentRule: 'color',
        };
        break;
    }

    set({
      currentSession: session,
      currentTrial: 0,
      totalTrials,
      currentDifficulty: difficulty,
      score: 0,
      streak: 0,
      isPlaying: true,
      isPaused: false,
      ...metrics,
    });

    return sessionId;
  },

  // End game session and calculate results
  endSession: async (sessionId, results) => {
    const state = get();
    if (!state.currentSession || state.currentSession.id !== sessionId) return;

    const { currentSession, goNoGoMetrics, nBackMetrics, taskSwitchMetrics } = state;
    const completedSession: GameSession = {
      ...currentSession,
      endedAt: new Date(),
      totalTrials: results.correct + results.incorrect,
      correctResponses: results.correct,
      incorrectResponses: results.incorrect,
      accuracyRate: results.correct / (results.correct + results.incorrect) || 0,
      avgReactionTimeMs: results.averageReactionTime,
      fruitsEarned: results.fruitsEarned,
    };

    try {
      // Save session to Supabase
      const { error: sessionError } = await supabase.from('game_sessions').insert({
        id: completedSession.id,
        user_id: completedSession.userId,
        game_type: completedSession.gameType,
        started_at: completedSession.startedAt.toISOString(),
        ended_at: completedSession.endedAt?.toISOString() || null,
        difficulty_level: completedSession.difficultyLevel,
        total_trials: completedSession.totalTrials,
        correct_responses: completedSession.correctResponses,
        incorrect_responses: completedSession.incorrectResponses,
        accuracy_rate: completedSession.accuracyRate,
        avg_reaction_time_ms: completedSession.avgReactionTimeMs || null,
        difficulty_adjusted: completedSession.difficultyAdjusted || false,
        score: completedSession.score || 0,
        fruits_earned: completedSession.fruitsEarned,
        go_nogo_metrics: goNoGoMetrics || null,
        nback_metrics: nBackMetrics || null,
        task_switch_metrics: taskSwitchMetrics || null,
      });

      if (sessionError) throw sessionError;

      // Update collected fruits
      if (results.fruitsEarned > 0) {
        // For now, add random fruit. In production, track which fruit was earned.
        const { error: fruitError } = await supabase.from('collected_fruits').insert({
          user_id: completedSession.userId,
          fruit_type: 'apple', // Default fruit
          quantity: results.fruitsEarned,
          earned_from: 'game',
          related_game_session_id: completedSession.id,
        });

        if (fruitError) console.error('Failed to save fruits:', fruitError);
      }
    } catch (error) {
      console.error('Failed to save game session:', error);
    }

    // Add to history and update total fruits
    set((state) => ({
      gameHistory: [...state.gameHistory, completedSession],
      totalFruits: state.totalFruits + results.fruitsEarned,
      ...initialGameState,
    }));
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  resetGame: () => set({ ...initialGameState }),

  // Record trial result
  recordTrial: (isCorrect, reactionTime, additional) => {
    const state = get();
    const { currentSession, goNoGoMetrics, nBackMetrics, taskSwitchMetrics } = state;

    if (!currentSession) return;

    // Update Go/No-Go metrics
    if (goNoGoMetrics && additional?.isGoTrial !== undefined) {
      const isGoTrial = additional.isGoTrial;
      const newMetrics = { ...goNoGoMetrics };
      newMetrics.totalTrials++;

      if (isGoTrial) {
        newMetrics.goTrials++;
        if (isCorrect) {
          newMetrics.correctGo++;
          newMetrics.reactionTimes.push(reactionTime);
        } else {
          newMetrics.omissionError++; // Go에 미반응
        }
      } else {
        newMetrics.noGoTrials++;
        if (isCorrect) {
          newMetrics.correctNoGo++;
        } else {
          newMetrics.commissionError++; // No-Go에 반응
        }
      }

      set({ goNoGoMetrics: newMetrics });
    }

    // Update N-Back metrics
    if (nBackMetrics && additional?.isTarget !== undefined) {
      const isTarget = additional.isTarget;
      const newMetrics = { ...nBackMetrics };
      newMetrics.totalTrials++;

      if (isTarget) {
        newMetrics.targets++;
        if (isCorrect) {
          newMetrics.hits++;
          newMetrics.reactionTimes.push(reactionTime);
        } else {
          newMetrics.misses++;
        }
      } else {
        newMetrics.nonTargets++;
        if (isCorrect) {
          newMetrics.correctRejections++;
        } else {
          newMetrics.falseAlarms++;
        }
      }

      set({ nBackMetrics: newMetrics });
    }

    // Update Task Switch metrics
    if (taskSwitchMetrics && additional?.isSwitchTrial !== undefined) {
      const isSwitchTrial = additional.isSwitchTrial;
      const newMetrics = { ...taskSwitchMetrics };
      newMetrics.totalTrials++;
      newMetrics.reactionTimes.push(reactionTime);

      if (isSwitchTrial) {
        newMetrics.switchTrials++;
        if (isCorrect) newMetrics.correctSwitch++;
      } else {
        newMetrics.nonSwitchTrials++;
        if (isCorrect) newMetrics.correctNonSwitch++;
      }

      set({ taskSwitchMetrics: newMetrics });
    }

    // Update streak
    if (isCorrect) {
      get().incrementStreak();
    } else {
      get().resetStreak();
    }
  },

  nextTrial: () => {
    set((state) => ({
      currentTrial: state.currentTrial + 1,
    }));
  },

  addScore: (points) => {
    set((state) => ({
      score: state.score + points,
    }));
  },

  incrementStreak: () => {
    const { streak, score } = get();
    const streakBonus = Math.min(streak * GAME_CONFIG.scoring.streakBonus, GAME_CONFIG.scoring.maxStreakBonus);

    set((state) => ({
      streak: state.streak + 1,
      score: state.score + streakBonus,
    }));
  },

  resetStreak: () => set({ streak: 0 }),

  // N-Back helpers
  addToNBackHistory: (fruit) => {
    set((state) => ({
      nBackHistory: [...(state.nBackHistory || []), fruit],
    }));
  },

  checkNBackMatch: (n) => {
    const { nBackHistory } = get();
    if (!nBackHistory || nBackHistory.length < n + 1) return false;

    const current = nBackHistory[nBackHistory.length - 1];
    const nBack = nBackHistory[nBackHistory.length - 1 - n];

    return current === nBack;
  },

  // Task Switch helpers
  setCurrentRule: (rule) => set({ currentRule: rule }),

  // Adaptive difficulty calculation
  calculateAdaptiveDifficulty: () => {
    const state = get();
    const { currentDifficulty, goNoGoMetrics, nBackMetrics, taskSwitchMetrics } = state;
    const { adaptive } = GAME_CONFIG;

    let accuracy = 0;

    if (goNoGoMetrics && goNoGoMetrics.totalTrials >= adaptive.windowSize) {
      const total = goNoGoMetrics.totalTrials;
      const correct = goNoGoMetrics.correctGo + goNoGoMetrics.correctNoGo;
      accuracy = correct / total;
    } else if (nBackMetrics && nBackMetrics.totalTrials >= adaptive.windowSize) {
      const total = nBackMetrics.totalTrials;
      const correct = nBackMetrics.hits + nBackMetrics.correctRejections;
      accuracy = correct / total;
    } else if (taskSwitchMetrics && taskSwitchMetrics.totalTrials >= adaptive.windowSize) {
      const total = taskSwitchMetrics.totalTrials;
      const correct = taskSwitchMetrics.correctSwitch + taskSwitchMetrics.correctNonSwitch;
      accuracy = correct / total;
    } else {
      return currentDifficulty; // Not enough data
    }

    if (accuracy >= adaptive.thresholdUp && currentDifficulty < adaptive.maxLevel) {
      return currentDifficulty + 1;
    }

    if (accuracy <= adaptive.thresholdDown && currentDifficulty > adaptive.minLevel) {
      return currentDifficulty - 1;
    }

    return currentDifficulty;
  },
}));

export default useGameStore;
