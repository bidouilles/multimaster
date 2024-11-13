import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TableSelector } from '../components/TableSelector';
import { TableVisualizer } from '../components/TableVisualizer';
import { Lightbulb, AlertTriangle, Trophy, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statistics';
import { motion } from 'framer-motion';

const DAILY_TIPS = [
  {
    title: "Multiplier par 2",
    tip: "Pour multiplier un nombre par 2, ajoute le nombre à lui-même. Par exemple : 6 × 2 = 6 + 6 = 12."
  },
  {
    title: "Multiplier par 3",
    tip: "Pour multiplier un nombre par 3, additionne le nombre trois fois. Par exemple : 6 × 3 = 6 + 6 + 6 = 18."
  },
  {
    title: "Multiplier par 4",
    tip: "Pour multiplier par 4, multiplie le nombre par 2, puis encore par 2. Par exemple : 7 × 4 = (7 × 2) × 2 = 14 × 2 = 28."
  },
  {
    title: "Multiplier par 5",
    tip: "Pour multiplier par 5, multiplie le nombre par 10 puis divise par 2. Par exemple : 8 × 5 = (8 × 10) ÷ 2 = 80 ÷ 2 = 40."
  },
  {
    title: "Multiplier par 6",
    tip: "Pour multiplier par 6, multiplie d'abord par 2, puis par 3. Par exemple : 7 × 6 = (7 × 2) × 3 = 14 × 3 = 42."
  },
  {
    title: "Multiplier par 7",
    tip: "Pour multiplier par 7, multiplie par 5 puis ajoute deux fois le nombre. Par exemple : 6 × 7 = (6 × 5) + (6 × 2) = 30 + 12 = 42."
  },
  {
    title: "Multiplier par 8",
    tip: "Pour multiplier par 8, multiplie le nombre par 2 trois fois. Par exemple : 5 × 8 = ((5 × 2) × 2) × 2 = 40."
  },
  {
    title: "Multiplier par 9",
    tip: "Pour multiplier par 9, multiplie le nombre par 10 puis soustrais le nombre une fois. Par exemple : 7 × 9 = (7 × 10) - 7 = 70 - 7 = 63."
  },
  {
    title: "Multiplier par 11",
    tip: "Pour multiplier un nombre à un chiffre par 11, répète le chiffre deux fois. Par exemple : 5 × 11 = 55."
  },
  {
    title: "Multiplier par 12",
    tip: "Pour multiplier par 12, multiplie par 10 puis ajoute deux fois le nombre. Par exemple : 7 × 12 = (7 × 10) + (7 × 2) = 70 + 14 = 84."
  },
  {
    title: "Multiplier par 25",
    tip: "Pour multiplier par 25, multiplie par 100 puis divise par 4. Par exemple : 8 × 25 = (8 × 100) ÷ 4 = 800 ÷ 4 = 200."
  },
  {
    title: "Les carrés",
    tip: "Un nombre multiplié par lui-même s'appelle un carré. Par exemple : 7 × 7 = 49 est le carré de 7."
  },
  {
    title: "Multiplier par 0",
    tip: "Tout nombre multiplié par 0 est égal à 0. Par exemple : 9 × 0 = 0."
  },
  {
    title: "Multiplier par 1",
    tip: "Tout nombre multiplié par 1 est égal à lui-même. Par exemple : 9 × 1 = 9."
  },
  {
    title: "La commutativité",
    tip: "L'ordre des facteurs n'affecte pas le produit. Par exemple : 3 × 4 = 4 × 3 = 12."
  },
  {
    title: "Propriété associative",
    tip: "Lors de la multiplication de plusieurs nombres, la façon de regrouper les facteurs n'affecte pas le produit. Par exemple : (2 × 3) × 4 = 2 × (3 × 4) = 24."
  },
  {
    title: "Astuce des voisins",
    tip: "Pour calculer 7 × 6, utilise 6 × 6 = 36 puis ajoute 6. Donc, 7 × 6 = 36 + 6 = 42."
  }
];

export function Learn() {
  const { selectedTables, level, xp } = useGame();
  const { user } = useAuth();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tablesToReview, setTablesToReview] = useState<{ table: number; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    const loadTableStats = async () => {
      if (!user) return;

      try {
        const scores = await Promise.all(
          Array.from({ length: 10 }, (_, i) => i + 1).map(async (table) => {
            const avgScore = await statisticsService.getAverageScoreByTable(user, table);
            return { table, score: avgScore };
          })
        );

        const needsReview = scores
          .filter(({ score }) => score < 70)
          .sort((a, b) => a.score - b.score);

        setTablesToReview(needsReview);
      } catch (error) {
        console.error('Error loading table statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTableStats();
  }, [user]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-purple-600">Apprendre les Tables</h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-purple-100 px-4 py-2 rounded-full">
            <span className="text-purple-600 font-medium">Niveau {level}</span>
          </div>
          <div className="bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-yellow-600 font-medium">{xp} XP</span>
          </div>
        </div>
      </div>

      {!loading && tablesToReview.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg"
        >
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-800">Tables à revoir</h3>
              <p className="text-orange-700 mt-1">
                Basé sur tes résultats, concentre-toi sur :
                {tablesToReview.slice(0, 3).map(({ table, score }, index) => (
                  <span key={table}>
                    {index > 0 && index === tablesToReview.slice(0, 3).length - 1 ? ' et ' : index > 0 ? ', ' : ' '}
                    <span className="font-semibold">la table de {table}</span>
                    <span className="text-sm">({Math.round(score)}%)</span>
                  </span>
                ))}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg cursor-pointer"
        onClick={nextTip}
      >
        <div className="flex items-start">
          <Lightbulb className="h-6 w-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-yellow-800">{DAILY_TIPS[currentTipIndex].title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                DAILY_TIPS[currentTipIndex].category === 'astuces' ? 'bg-blue-100 text-blue-600' :
                DAILY_TIPS[currentTipIndex].category === 'trucs' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {DAILY_TIPS[currentTipIndex].category}
              </span>
            </div>
            <p className="text-yellow-700 mt-1">
              {DAILY_TIPS[currentTipIndex].tip}
            </p>
            <p className="text-yellow-600 text-sm mt-2 italic">
              Clique pour voir une autre astuce ! ({currentTipIndex + 1}/{DAILY_TIPS.length})
            </p>
          </div>
        </div>
      </motion.div>

      <TableSelector />
      
      {selectedTables.length > 0 && <TableVisualizer />}

      {!selectedTables.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-8 bg-gray-50 rounded-xl"
        >
          <p className="text-gray-600">
            👆 Commence par sélectionner une table de multiplication ci-dessus !
          </p>
        </motion.div>
      )}

      {showAchievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 bg-green-100 p-4 rounded-lg shadow-lg flex items-center space-x-3"
        >
          <Trophy className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-800">Nouveau succès !</h4>
            <p className="text-green-600 text-sm">Tu as débloqué une nouvelle astuce !</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}