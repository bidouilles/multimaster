import React from 'react';
import { useGame } from '../context/GameContext';

export function TableSelector() {
  const { selectedTables, setSelectedTables } = useGame();

  const toggleTable = (table: number) => {
    if (selectedTables.includes(table)) {
      setSelectedTables(selectedTables.filter((t) => t !== table));
    } else {
      setSelectedTables([...selectedTables, table].sort((a, b) => a - b));
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Choisis tes Tables</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((table) => (
          <button
            key={table}
            onClick={() => toggleTable(table)}
            className={`
              p-4 rounded-lg text-lg font-semibold transition-all
              ${
                selectedTables.includes(table)
                  ? 'bg-purple-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }
            `}
          >
            {table}×
          </button>
        ))}
      </div>
    </div>
  );
}