import React, { createContext, useContext, useState, useEffect } from 'react';
import { statisticsService, GameStats } from '../services/statistics';
import { useAuth } from './AuthContext';

interface GameContextType {
  selectedTables: number[];
  setSelectedTables: (tables: number[]) => void;
  score: number;
  setScore: (score: number) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  saveGameStats: (stats: Omit<GameStats, 'date' | 'userId' | 'userName'>) => Promise<void>;
  loadLastScore: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const loadLastScore = async () => {
    if (!user) {
      setScore(0);
      return;
    }

    try {
      const recentStats = await statisticsService.getRecentStats(user, 1);
      if (recentStats.length > 0) {
        setScore(recentStats[0].score);
      }
    } catch (error) {
      console.error('Error loading last score:', error);
    }
  };

  useEffect(() => {
    loadLastScore();
  }, [user]);

  const saveGameStats = async (stats: Omit<GameStats, 'date' | 'userId' | 'userName'>) => {
    if (!user) return;
    
    try {
      await statisticsService.saveGameStats(stats, user);
      await loadLastScore(); // Reload the score after saving new stats
    } catch (error) {
      console.error('Error saving game stats:', error);
    }
  };

  return (
    <GameContext.Provider
      value={{
        selectedTables,
        setSelectedTables,
        score,
        setScore,
        difficulty,
        setDifficulty,
        saveGameStats,
        loadLastScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}