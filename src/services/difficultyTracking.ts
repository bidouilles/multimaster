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
  setDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface MultiplicationDifficulty {
  table: number;
  multiplier: number;
  successRate: number;
  attempts: number;
  lastAttempt: Date;
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
  private static COLLECTION_NAME = 'difficultyStats';

  private async ensureUserStats(user: User): Promise<void> {
    try {
      const statsRef = doc(db, DifficultyTracker.COLLECTION_NAME, user.uid);
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        if (!statsDoc.exists()) {
          await setDoc(statsRef, {
            userId: user.uid,
            difficulties: [],
            lastUpdate: new Date()
          });
        }
      });
    } catch (error) {
      console.error('Error ensuring user stats:', error);
    }
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
        if (!statsDoc.exists()) return;

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
            lastAttempt: new Date()
          });
        } else {
          const difficulty = stats.difficulties[difficultyIndex];
          const newSuccessRate = (
            (difficulty.successRate * difficulty.attempts + (isCorrect ? 100 : 0)) /
            (difficulty.attempts + 1)
          );
          
          stats.difficulties[difficultyIndex] = {
            ...difficulty,
            successRate: newSuccessRate,
            attempts: difficulty.attempts + 1,
            lastAttempt: new Date()
          };
        }

        stats.lastUpdate = new Date();
        transaction.set(statsRef, stats);
      });
    } catch (error) {
      console.error('Error updating difficulty:', error);
    }
  }

  async getWeakPoints(user: User): Promise<MultiplicationDifficulty[]> {
    if (!user?.uid) return [];

    try {
      await this.ensureUserStats(user);
      const statsRef = doc(db, DifficultyTracker.COLLECTION_NAME, user.uid);
      const statsDoc = await getDocs(query(collection(db, DifficultyTracker.COLLECTION_NAME), 
        where('userId', '==', user.uid),
        limit(1)
      ));

      if (statsDoc.empty) return [];

      const stats = statsDoc.docs[0].data() as DifficultyStats;
      
      return stats.difficulties
        .filter(d => d.attempts >= DifficultyTracker.MIN_ATTEMPTS)
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