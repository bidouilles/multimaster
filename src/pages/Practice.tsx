import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TableSelector } from '../components/TableSelector';
import { Quiz } from '../components/Quiz';
import { Brain, Timer, Zap } from 'lucide-react';

export function Practice() {
  const { selectedTables, difficulty, setDifficulty } = useGame();
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted && selectedTables.length > 0) {
    return <Quiz onEnd={() => setGameStarted(false)} />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-purple-600">Mode Entraînement</h1>
        <p className="text-gray-600">Teste tes compétences en multiplication !</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Niveau de Difficulté</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { level: 'easy', label: 'Facile', icon: Brain, color: 'green' },
            { level: 'medium', label: 'Moyen', icon: Timer, color: 'yellow' },
            { level: 'hard', label: 'Difficile', icon: Zap, color: 'red' },
          ].map(({ level, label, icon: Icon, color }) => (
            <button
              key={level}
              onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
              className={`
                p-4 rounded-lg flex items-center space-x-3 transition-all
                ${difficulty === level
                  ? `bg-${color}-100 ring-2 ring-${color}-400`
                  : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <Icon className={`h-5 w-5 text-${color}-500`} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <TableSelector />

      {selectedTables.length > 0 && (
        <button
          onClick={() => setGameStarted(true)}
          className="w-full p-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Commencer l'Entraînement
        </button>
      )}
    </div>
  );
}