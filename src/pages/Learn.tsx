import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TableSelector } from '../components/TableSelector';
import { TableVisualizer } from '../components/TableVisualizer';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statistics';

const DAILY_TIPS = [
  {
    title: "Multiplier par 5",
    tip: "Pour multiplier par 5, tu peux diviser par 2 et multiplier par 10 ! Par exemple : 8 × 5 = (8 ÷ 2) × 10 = 4 × 10 = 40"
  },
  {
    title: "Multiplier par 9",
    tip: "Pour multiplier par 9, multiplie par 10 et soustrais le nombre une fois ! Par exemple : 7 × 9 = (7 × 10) - 7 = 70 - 7 = 63"
  },
  {
    title: "Multiplier par 2",
    tip: "Multiplier par 2, c'est additionner le nombre avec lui-même ! Par exemple : 6 × 2 = 6 + 6 = 12"
  },
  {
    title: "Les carrés",
    tip: "Un nombre multiplié par lui-même s'appelle un carré ! Par exemple : 7 × 7 = 49 est le carré de 7"
  },
  {
    title: "Multiplier par 4",
    tip: "Pour multiplier par 4, tu peux multiplier deux fois par 2 ! Par exemple : 7 × 4 = (7 × 2) × 2 = 14 × 2 = 28"
  },
  {
    title: "La commutativité",
    tip: "L'ordre des nombres ne change pas le résultat ! 3 × 4 = 4 × 3 = 12"
  },
  {
    title: "Multiplier par 3",
    tip: "Pour multiplier par 3, additionne le nombre deux fois ! Par exemple : 6 × 3 = 6 + 6 + 6 = 18"
  },
  {
    title: "Multiplier par 6",
    tip: "Pour multiplier par 6, multiplie d'abord par 2, puis par 3 ! Par exemple : 7 × 6 = (7 × 2) × 3 = 14 × 3 = 42"
  },
  {
    title: "Multiplier par 8",
    tip: "Pour multiplier par 8, multiplie trois fois par 2 ! Par exemple : 5 × 8 = ((5 × 2) × 2) × 2 = 40"
  },
  {
    title: "Les doubles voisins",
    tip: "7 × 6 est proche de 6 × 6 = 36. Donc 7 × 6 = 36 + 6 = 42"
  }
];

export function Learn() {
  const { selectedTables } = useGame();
  const { user } = useAuth();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tablesToReview, setTablesToReview] = useState<{ table: number; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Filtrer les tables avec un score moyen inférieur à 70%
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
        <p className="text-gray-600">Sélectionne les tables que tu veux apprendre et pratiquer !</p>
      </div>

      {!loading && tablesToReview.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-800">Tables à revoir</h3>
              <p className="text-orange-700 mt-1">
                Basé sur tes résultats, tu devrais te concentrer sur :
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
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg cursor-pointer" onClick={nextTip}>
        <div className="flex items-start">
          <Lightbulb className="h-6 w-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">{DAILY_TIPS[currentTipIndex].title}</h3>
            <p className="text-yellow-700 mt-1">
              {DAILY_TIPS[currentTipIndex].tip}
            </p>
            <p className="text-yellow-600 text-sm mt-2 italic">
              Clique pour voir une autre astuce ! ({currentTipIndex + 1}/{DAILY_TIPS.length})
            </p>
          </div>
        </div>
      </div>

      <TableSelector />
      
      {selectedTables.length > 0 && <TableVisualizer />}

      {!selectedTables.length && (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <p className="text-gray-600">
            👆 Commence par sélectionner une table de multiplication ci-dessus !
          </p>
        </div>
      )}
    </div>
  );
}