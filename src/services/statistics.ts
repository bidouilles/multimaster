import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface GameStats {
  date: Date;
  userId: string;
  userName: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tables: number[];
  questionsAnswered: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface UserRanking {
  userName: string;
  averageScore: number;
  gamesPlayed: number;
  bestScore: number;
}

class StatisticsError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'StatisticsError';
  }
}

export const statisticsService = {
  async saveGameStats(stats: Omit<GameStats, 'date' | 'userId' | 'userName'>, user: User) {
    if (!user?.uid) {
      throw new StatisticsError('User must be authenticated to save stats');
    }

    try {
      const statsCollection = collection(db, 'statistics');
      await addDoc(statsCollection, {
        ...stats,
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        date: new Date()
      });
    } catch (error) {
      throw new StatisticsError('Failed to save game stats', error);
    }
  },

  async getRecentStats(user: User, limitCount = 10) {
    if (!user?.uid) {
      return [];
    }

    try {
      const statsCollection = collection(db, 'statistics');
      const q = query(
        statsCollection,
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('Error getting recent stats:', error);
      return [];
    }
  },

  async getStatsByDifficulty(user: User, difficulty: 'easy' | 'medium' | 'hard') {
    if (!user?.uid) {
      return [];
    }

    try {
      const statsCollection = collection(db, 'statistics');
      const q = query(
        statsCollection,
        where('userId', '==', user.uid),
        where('difficulty', '==', difficulty),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('Error getting stats by difficulty:', error);
      return [];
    }
  },

  async getAverageScoreByTable(user: User, tableNumber: number) {
    if (!user?.uid) {
      return 0;
    }

    try {
      const statsCollection = collection(db, 'statistics');
      const q = query(
        statsCollection,
        where('userId', '==', user.uid),
        where('tables', 'array-contains', tableNumber)
      );
      const querySnapshot = await getDocs(q);
      
      const stats = querySnapshot.docs.map(doc => doc.data());
      if (stats.length === 0) return 0;
      
      const totalScore = stats.reduce((sum, stat) => sum + stat.score, 0);
      return totalScore / stats.length;
    } catch (error) {
      console.warn('Error getting average score:', error);
      return 0;
    }
  },

  async getTopPlayers(limitCount = 10): Promise<UserRanking[]> {
    try {
      const statsCollection = collection(db, 'statistics');
      const querySnapshot = await getDocs(statsCollection);
      
      const userStats = new Map<string, {
        userName: string;
        scores: number[];
        gamesPlayed: number;
      }>();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const userId = data.userId;
        const userName = data.userName;
        const score = data.score;

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userName,
            scores: [],
            gamesPlayed: 0
          });
        }

        const stats = userStats.get(userId)!;
        stats.scores.push(score);
        stats.gamesPlayed++;
      });

      const rankings: UserRanking[] = Array.from(userStats.values())
        .filter(stats => stats.scores.length > 0)
        .map(stats => ({
          userName: stats.userName,
          averageScore: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
          gamesPlayed: stats.gamesPlayed,
          bestScore: Math.max(...stats.scores)
        }));

      return rankings
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, limitCount);
    } catch (error) {
      console.warn('Error getting top players:', error);
      return [];
    }
  }
};