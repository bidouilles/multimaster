import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight, Volume2, Grid, List } from 'lucide-react';
import { MultiplicationTable } from './MultiplicationTable';

export function TableVisualizer() {
  const { selectedTables } = useGame();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const currentTable = selectedTables[currentTableIndex];

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
  };

  const nextTable = () => {
    setCurrentTableIndex((prev) => (prev + 1) % selectedTables.length);
  };

  const prevTable = () => {
    setCurrentTableIndex((prev) => 
      prev === 0 ? selectedTables.length - 1 : prev - 1
    );
  };

  const ListView = () => (
    <div className="grid gap-4">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((multiplier) => {
        const result = currentTable * multiplier;
        const equation = `${currentTable} fois ${multiplier} égale ${result}`;

        return (
          <div
            key={multiplier}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors group"
          >
            <span className="text-xl font-medium text-gray-700">
              {currentTable} × {multiplier} = {result}
            </span>
            <button
              onClick={() => speak(equation)}
              className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100"
              aria-label="Écouter l'équation"
            >
              <Volume2 className="h-5 w-5 text-purple-600" />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        {viewMode === 'list' && (
          <button
            onClick={prevTable}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Table précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="flex items-center space-x-4">
          {viewMode === 'list' && (
            <h2 className="text-2xl font-bold text-purple-600">
              Table de {currentTable}
            </h2>
          )}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              aria-label="Vue liste"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              aria-label="Vue grille"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
        {viewMode === 'list' && (
          <button
            onClick={nextTable}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Table suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <>
          <ListView />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Le savais-tu ?</h3>
            <p className="text-blue-600">
              {currentTable} × 10 = {currentTable}0 : Il suffit d'ajouter un zéro !
            </p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tableau de Multiplication Complet</h2>
          <MultiplicationTable />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Le savais-tu ?</h3>
            <p className="text-blue-600">
              Les nombres dans la diagonale sont les carrés parfaits : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 !
            </p>
          </div>
        </>
      )}
    </div>
  );
}