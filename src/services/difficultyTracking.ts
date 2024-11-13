import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  runTransaction,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface MultiplicationDifficulty {
  table: number;
  multiplier: number;
  successRate: number;
  attempts: number;
  lastAttempt: Date;
  consecutiveSuccesses: number;
}

export interface DifficultyStats {
  userId: string;
  difficulties: MultiplicationDifficulty[];
  lastUpdate: Date;
}

class DifficultyTracker {
  private static WEIGHT_RECENT = 0.7;
  private static WEIGHT_HISTORY = 0.3;
  private static MIN_ATTEMPTS = 3;
  private static MIN_SUCCESS_RATE = 85;
  private static CONSECUTIVE_SUCCESSES_REQUIRED = 3;
  private static COLLECTION_NAME = 'difficultyStats';

  private async ensureUserStats(user: User): Promise<void> {
    if (!user?.uid) return;

    try {
      const statsRef = doc(db, DifficultyTracker.COLLECTION_NAME, user.uid);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        await setDoc(statsRef, {
          userId: user.uid,
          difficulties: [],
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      console.error('Error ensuring user stats:', error);
      throw new Error('Failed to initialize user statistics');
    }
  }

  private isMultiplicationMastered(difficulty: MultiplicationDifficulty): boolean {
    return (
      difficulty.attempts >= DifficultyTracker.MIN_ATTEMPTS &&
      difficulty.successRate >= DifficultyTracker.MIN_SUCCESS_RATE &&
      difficulty.consecutiveSuccesses >= DifficultyTracker.CONSECUTIVE_SUCCESSES_REQUIRED
    );
  }

  private isMultiplicationWeakPoint(difficulty: MultiplicationDifficulty): boolean {
    return (
      difficulty.attempts >= DifficultyTracker.MIN_ATTEMPTS &&
      (
        difficulty.successRate < DifficultyTracker.MIN_SUCCESS_RATE ||
        difficulty.consecutiveSuccesses < DifficultyTracker.CONSECUTIVE_SUCCESSES_REQUIRED
      )
    );
  }

  async updateDifficulty(
    user: User,
    table: number,
    multiplier: number,
    isCorrect: boolean
  ): Promise<void> {
    if (!user?.uid) return;

    try {
      await this.ensureUserStats(user);
      const statsRef = doc(db, DifficultyTracker.COLLECTION_NAME, user.uid);

      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        if (!statsDoc.exists()) {
          throw new Error('User statistics not found');
        }

        const stats = statsDoc.data() as DifficultyStats;
        const difficultyIndex = stats.difficulties.findIndex(
          d => d.table === table && d.multiplier === multiplier
        );

        if (difficultyIndex === -1) {
          stats.difficulties.push({
            table,
            multiplier,
            successRate: isCorrect ? 100 : 0,
            attempts: 1,
            lastAttempt: new Date(),
            consecutiveSuccesses: isCorrect ? 1 : 0
          });
        } else {
          const difficulty = stats.difficulties[difficultyIndex];
          const newSuccessRate = (
            (difficulty.successRate * difficulty.attempts + (isCorrect ? 100 : 0)) /
            (difficulty.attempts + 1)
          );
          
          const consecutiveSuccesses = isCorrect 
            ? difficulty.consecutiveSuccesses + 1 
            : 0;

          const updatedDifficulty = {
            ...difficulty,
            successRate: newSuccessRate,
            attempts: difficulty.attempts + 1,
            lastAttempt: new Date(),
            consecutiveSuccesses
          };

          if (this.isMultiplicationMastered(updatedDifficulty)) {
            stats.difficulties.splice(difficultyIndex, 1);
          } else {
            stats.difficulties[difficultyIndex] = updatedDifficulty;
          }
        }

        stats.lastUpdate = new Date();
        transaction.set(statsRef, stats);
      });
    } catch (error) {
      console.error('Error updating difficulty:', error);
      throw new Error('Failed to update difficulty statistics');
    }
  }

  async getWeakPoints(user: User): Promise<MultiplicationDifficulty[]> {
    if (!user?.uid) return [];

    try {
      await this.ensureUserStats(user);
      const statsRef = doc(db, DifficultyTracker.COLLECTION_NAME, user.uid);
      const statsDoc = await getDoc(statsRef);

      if (!statsDoc.exists()) {
        return [];
      }

      const stats = statsDoc.data() as DifficultyStats;
      
      return stats.difficulties
        .filter(d => this.isMultiplicationWeakPoint(d))
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting weak points:', error);
      return [];
    }
  }

  calculateProbability(difficulties: MultiplicationDifficulty[]): Map<string, number> {
    const probabilities = new Map<string, number>();
    const totalWeight = difficulties.reduce((sum, d) => sum + (100 - d.successRate), 0);

    if (totalWeight === 0) return probabilities;

    difficulties.forEach(d => {
      const weight = (100 - d.successRate) / totalWeight;
      probabilities.set(`${d.table}x${d.multiplier}`, weight);
    });

    return probabilities;
  }
}

export const difficultyTracker = new DifficultyTracker();