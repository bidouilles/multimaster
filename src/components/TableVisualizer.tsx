import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight, Volume2, Grid, List } from 'lucide-react';
import { MultiplicationTable } from './MultiplicationTable';

const SPECIAL_TIPS = [
  "Les carrés (un nombre multiplié par lui-même) forment la séquence : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.",
  "La commutativité : l'ordre des facteurs ne change pas le résultat. Par exemple : 4 × 3 = 3 × 4.",
  "Pour vérifier un calcul, effectue l'opération inverse pour voir si tu obtiens le nombre initial.",
  "Les multiples de 5 se terminent toujours par 0 ou 5.",
  "Les multiples de 2 sont toujours des nombres pairs.",
  "Pour multiplier un chiffre par 11, écris deux fois le même chiffre : 4 × 11 = 44.",
  "La somme des chiffres d'un multiple de 9 est toujours un multiple de 9.",
  "Pour multiplier par 4, multiplie par 2 deux fois de suite.",
  "Les multiples de 3 ont une somme de chiffres qui est un multiple de 3.",
  "Pour multiplier par 15, multiplie par 10 puis ajoute la moitié du nombre initial.",
  "La distributivité : 7 × 6 = (7 × 5) + (7 × 1) = 35 + 7 = 42.",
  "Pour multiplier par 25, multiplie par 100 puis divise par 4. Par exemple : 8 × 25 = (8 × 100) ÷ 4 = 800 ÷ 4 = 200.",
  "Un nombre est divisible par 4 si les deux derniers chiffres forment un nombre divisible par 4.",
  "Pour multiplier par 99, multiplie par 100 puis soustrais le nombre initial.",
  "La règle des signes : positif × positif = positif, négatif × négatif = positif, positif × négatif = négatif.",
  "Pour multiplier par 12, multiplie par 10 puis ajoute deux fois le nombre initial.",
  "Les carrés parfaits ont un nombre impair de diviseurs.",
  "Pour multiplier par 50, multiplie par 100 puis divise par 2.",
  "La somme ou le produit de deux nombres pairs donne toujours un nombre pair.",
  "Pour multiplier par 20, multiplie par 2 puis ajoute un zéro à la fin.",
  "Les multiples de 6 sont pairs et la somme de leurs chiffres est un multiple de 3.",
  "Pour multiplier par 16, multiplie par 2 quatre fois de suite.",
  "Les multiples de 10 se terminent toujours par 0.",
  "Pour multiplier par 18, multiplie par 20 puis soustrais deux fois le nombre initial.",
  "La différence entre deux carrés parfaits consécutifs augmente de 2 à chaque fois."
];


export function TableVisualizer() {
  const { selectedTables } = useGame();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [tipIndex, setTipIndex] = useState(0);
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

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % SPECIAL_TIPS.length);
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
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg cursor-pointer" onClick={nextTip}>
              <h3 className="font-semibold text-blue-800 mb-2">Le savais-tu ?</h3>
              <div className="space-y-3">
                <p className="text-blue-600 border-t border-blue-100 pt-3">
                  {SPECIAL_TIPS[tipIndex]}
                </p>
                <p className="text-blue-500 text-sm italic">
                  Clique pour voir une autre astuce ! ({tipIndex + 1}/{SPECIAL_TIPS.length})
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tableau de Multiplication Complet</h2>
          <MultiplicationTable />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg cursor-pointer" onClick={nextTip}>
            <h3 className="font-semibold text-blue-800 mb-2">Le savais-tu ?</h3>
            <p className="text-blue-600">{SPECIAL_TIPS[tipIndex]}</p>
            <p className="text-blue-500 text-sm italic mt-2">
              Clique pour voir une autre astuce ! ({tipIndex + 1}/{SPECIAL_TIPS.length})
            </p>
          </div>
        </>
      )}
    </div>
  );
}