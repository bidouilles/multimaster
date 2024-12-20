import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, Award, Medal, Users, AlertTriangle } from 'lucide-react';
import { statisticsService, UserRanking } from '../services/statistics';
import { difficultyTracker } from '../services/difficultyTracking';
import { motion } from 'framer-motion';

interface WeakPoint {
  table: number;
  multiplier: number;
  successRate: number;
  attempts: number;
}

export function Progress() {
  const { score, loadLastScore } = useGame();
  const { user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadLastScore();
        const rankings = await statisticsService.getTopPlayers();
        setTopPlayers(rankings);

        if (user) {
          const difficulties = await difficultyTracker.getWeakPoints(user);
          setWeakPoints(difficulties);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [loadLastScore, user]);

  const achievements = [
    {
      icon: Trophy,
      title: 'Apprenti',
      description: 'Complète 10 questions en mode entraînement',
      unlocked: true,
    },
    {
      icon: Star,
      title: 'Score Parfait',
      description: 'Obtiens 100% en mode entraînement',
      unlocked: score === 100,
    },
    {
      icon: Award,
      title: 'Maître de la Vitesse',
      description: 'Termine le mode difficile avec un score parfait',
      unlocked: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-purple-600">Tes Progrès</h1>
        <p className="text-gray-600">Suis tes réussites et compare tes scores !</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dernier Score</h2>
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-600">{score}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Classement des Joueurs</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-4 text-gray-600">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-50">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-purple-600">Rang</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-purple-600">Joueur</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-purple-600">Moy.</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-purple-600">Max</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-purple-600">Parties</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, index) => (
                  <tr 
                    key={player.userName}
                    className={`${
                      player.userName === user?.displayName ? 'bg-purple-50' : ''
                    } border-t border-gray-200`}
                  >
                    <td className="px-4 py-2">
                      {index + 1 <= 3 ? (
                        <Medal className={`h-5 w-5 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {player.userName}
                      {player.userName === user?.displayName && ' (Toi)'}
                    </td>
                    <td className="px-4 py-2 text-right">{player.averageScore.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right">{player.bestScore}%</td>
                    <td className="px-4 py-2 text-right">{player.gamesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Récompenses</h2>
        <div className="grid gap-4">
          {achievements.map(({ icon: Icon, title, description, unlocked }) => (
            <div
              key={title}
              className={`p-4 rounded-lg border-2 ${
                unlocked
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  unlocked ? 'bg-purple-200' : 'bg-gray-200'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    unlocked ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {weakPoints.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Points à Renforcer</h2>
          </div>
          <div className="space-y-4">
            {weakPoints.map((point) => (
              <div
                key={`${point.table}x${point.multiplier}`}
                className="bg-orange-50 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-orange-700">
                      {point.table} × {point.multiplier}
                    </span>
                    <p className="text-sm text-orange-600 mt-1">
                      {point.attempts} tentatives
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-700">
                      {Math.round(point.successRate)}%
                    </div>
                    <p className="text-sm text-orange-600">de réussite</p>
                  </div>
                </div>
                <div className="mt-2 w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${point.successRate}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-600 mt-4">
              Ces multiplications nécessitent plus d'attention. Continue à t'entraîner pour améliorer tes scores !
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}