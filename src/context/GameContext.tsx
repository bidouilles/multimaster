import React, { createContext, useContext, useState, useEffect } from 'react';
import { statisticsService, GameStats } from '../services/statistics';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface GameContextType {
  selectedTables: number[];
  setSelectedTables: (tables: number[]) => void;
  score: number;
  setScore: (score: number) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  saveGameStats: (stats: Omit<GameStats, 'date' | 'userId' | 'userName'>) => Promise<void>;
  loadLastScore: () => Promise<void>;
  streak: number;
  setStreak: (streak: number) => void;
  dailyChallenge: {
    completed: boolean;
    target: number;
    progress: number;
  };
  updateDailyChallenge: (progress: number) => void;
  level: number;
  xp: number;
  addXP: (points: number) => void;
  powerups: {
    timeFreeze: number;
    doublePoints: number;
    skipQuestion: number;
  };
  usePowerup: (type: 'timeFreeze' | 'doublePoints' | 'skipQuestion') => void;
  earnPowerup: (type: 'timeFreeze' | 'doublePoints' | 'skipQuestion') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [streak, setStreak] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState({
    completed: false,
    target: 10,
    progress: 0
  });
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [powerups, setPowerups] = useState({
    timeFreeze: 3,
    doublePoints: 2,
    skipQuestion: 1
  });

  const addXP = (points: number) => {
    const newXP = xp + points;
    setXP(newXP);
    
    const newLevel = LEVELS_XP.findIndex(threshold => newXP < threshold) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      if (newLevel % 2 === 0) {
        earnPowerup('timeFreeze');
      } else if (newLevel % 3 === 0) {
        earnPowerup('doublePoints');
      } else if (newLevel % 5 === 0) {
        earnPowerup('skipQuestion');
      }
    }
  };

  const updateDailyChallenge = (progress: number) => {
    setDailyChallenge(prev => {
      const newProgress = prev.progress + progress;
      const completed = newProgress >= prev.target && !prev.completed;
      
      if (completed) {
        addXP(50);
        earnPowerup('doublePoints');
      }
      
      return {
        ...prev,
        progress: newProgress,
        completed
      };
    });
  };

  const usePowerup = (type: 'timeFreeze' | 'doublePoints' | 'skipQuestion') => {
    setPowerups(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  const earnPowerup = (type: 'timeFreeze' | 'doublePoints' | 'skipQuestion') => {
    setPowerups(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const saveGameStats = async (stats: Omit<GameStats, 'date' | 'userId' | 'userName'>) => {
    if (!user) return;
    try {
      await statisticsService.saveGameStats(stats, user);
    } catch (error) {
      console.error('Error saving game stats:', error);
    }
  };

  const loadLastScore = async () => {
    if (!user) return;
    try {
      const recentStats = await statisticsService.getRecentStats(user, 1);
      if (recentStats.length > 0) {
        setScore(recentStats[0].score);
      }
    } catch (error) {
      console.error('Error loading last score:', error);
    }
  };

  return (
    <GameContext.Provider value={{
      selectedTables,
      setSelectedTables,
      score,
      setScore,
      difficulty,
      setDifficulty,
      saveGameStats,
      loadLastScore,
      streak,
      setStreak,
      dailyChallenge,
      updateDailyChallenge,
      level,
      xp,
      addXP,
      powerups,
      usePowerup,
      earnPowerup
    }}>
      {children}
    </GameContext.Provider>
  );
}

const LEVELS_XP = [100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000];