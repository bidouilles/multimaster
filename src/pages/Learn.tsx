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
    title: "Multiplier par 5",
    tip: "Pour multiplier par 5, tu peux diviser par 2 et multiplier par 10 ! Par exemple : 8 × 5 = (8 ÷ 2) × 10 = 4 × 10 = 40",
    category: "astuces"
  },
  {
    title: "Multiplier par 9",
    tip: "Pour multiplier par 9, multiplie par 10 et soustrais le nombre une fois ! Par exemple : 7 × 9 = (7 × 10) - 7 = 70 - 7 = 63",
    category: "astuces"
  },
  {
    title: "La méthode des doigts pour la table de 9",
    tip: "Place tes 10 doigts devant toi. Pour 9×3, plie le 3ème doigt. À gauche tu as 2 doigts (20), à droite 7 doigts (7). Donc 9×3 = 27 !",
    category: "trucs"
  },
  {
    title: "Les doubles",
    tip: "La table de 2, ce sont les doubles ! 2×6 = 6+6 = 12. Facile non ?",
    category: "astuces"
  },
  {
    title: "Les carrés",
    tip: "Un nombre multiplié par lui-même s'appelle un carré ! Par exemple : 7 × 7 = 49 est le carré de 7. Les carrés forment une diagonale dans le tableau !",
    category: "découverte"
  },
  {
    title: "Multiplier par 4",
    tip: "Pour multiplier par 4, double le nombre deux fois ! Par exemple : 7 × 4 = (7 × 2) × 2 = 14 × 2 = 28",
    category: "astuces"
  },
  {
    title: "La commutativité",
    tip: "L'ordre des nombres ne change pas le résultat ! 3 × 4 = 4 × 3 = 12. C'est pour ça que le tableau est symétrique !",
    category: "découverte"
  },
  {
    title: "Multiplier par 3",
    tip: "Pour multiplier par 3, additionne le nombre deux fois ! Par exemple : 6 × 3 = 6 + 6 + 6 = 18",
    category: "astuces"
  },
  {
    title: "Les voisins",
    tip: "7 × 6 est proche de 6 × 6 = 36. Donc 7 × 6 = 36 + 6 = 42. Utilise les résultats que tu connais !",
    category: "trucs"
  },
  {
    title: "La table de 5",
    tip: "Les résultats de la table de 5 se terminent toujours par 0 ou 5 ! 5, 10, 15, 20, 25, 30, 35, 40, 45, 50",
    category: "découverte"
  },
  {
    title: "Décomposer les multiplications",
    tip: "Pour 7×8, tu peux faire (5×8) + (2×8) = 40 + 16 = 56",
    category: "trucs"
  },
  {
    title: "Les régularités",
    tip: "Dans la table de 4, les résultats augmentent de 4 en 4 : 4, 8, 12, 16, 20, 24, 28, 32, 36, 40",
    category: "découverte"
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