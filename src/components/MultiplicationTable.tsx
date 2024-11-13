import React from 'react';
import { useGame } from '../context/GameContext';

export function MultiplicationTable() {
  const { selectedTables } = useGame();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-purple-100">×</th>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <th key={num} className="border border-gray-300 p-2 bg-purple-100">
                {num}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((row) => (
            <tr key={row}>
              <th className="border border-gray-300 p-2 bg-purple-100">{row}</th>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((col) => (
                <td
                  key={`${row}-${col}`}
                  className={`border border-gray-300 p-2 text-center ${
                    selectedTables.includes(row) || selectedTables.includes(col)
                      ? 'bg-purple-50 font-bold'
                      : ''
                  }`}
                >
                  {row * col}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}