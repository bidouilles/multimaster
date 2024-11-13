import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TableSelector } from '../components/TableSelector';
import { TableVisualizer } from '../components/TableVisualizer';
import { Lightbulb } from 'lucide-react';

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
  }
];

export function Learn() {
  const { selectedTables } = useGame();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-purple-600">Apprendre les Tables</h1>
        <p className="text-gray-600">Sélectionne les tables que tu veux apprendre et pratiquer !</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg cursor-pointer" onClick={nextTip}>
        <div className="flex items-start">
          <Lightbulb className="h-6 w-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">{DAILY_TIPS[currentTipIndex].title}</h3>
            <p className="text-yellow-700 mt-1">
              {DAILY_TIPS[currentTipIndex].tip}
            </p>
            <p className="text-yellow-600 text-sm mt-2 italic">
              Clique pour voir une autre astuce !
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