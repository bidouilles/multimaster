import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';

interface MemoryGameProps {
  onGameEnd: (score: number) => void;
}

interface MemoryCard {
  id: number;
  value: number;
  type: 'question' | 'answer';
  question?: { a: number; b: number };
}

export function MemoryGame({ onGameEnd }: MemoryGameProps) {
  const { selectedTables } = useGame();
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // Temps augmenté à 60 secondes

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const score = Math.round((matchedPairs.length / 16) * 100);
          onGameEnd(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchedPairs.length]);

  function initializeGame() {
    const pairs: MemoryCard[] = [];
    const usedQuestions = new Set();

    while (pairs.length < 16) {
      const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const multiplier = Math.floor(Math.random() * 10) + 1;
      const key = `${table}x${multiplier}`;

      if (!usedQuestions.has(key)) {
        usedQuestions.add(key);
        const result = table * multiplier;
        
        pairs.push(
          { id: pairs.length, value: result, type: 'answer' },
          { 
            id: pairs.length + 1, 
            value: result, 
            type: 'question',
            question: { a: table, b: multiplier }
          }
        );
      }
    }

    setMemoryCards(shuffleArray(pairs));
  }

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function handleCardClick(cardId: number) {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = memoryCards.find(card => card.id === firstId);
      const secondCard = memoryCards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        setMatchedPairs([...matchedPairs, firstId, secondId]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-medium">Paires trouvées: {matchedPairs.length / 2}</div>
        <div className="text-lg font-medium">Temps: {timeLeft}s</div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {memoryCards.map(card => (
          <motion.div
            key={card.id}
            className={`aspect-square cursor-pointer ${
              flippedCards.includes(card.id) || matchedPairs.includes(card.id)
                ? 'rotate-y-180'
                : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className={`
              w-full h-full rounded-xl p-4 flex items-center justify-center text-center
              ${flippedCards.includes(card.id) || matchedPairs.includes(card.id)
                ? 'bg-purple-100 text-purple-700'
                : 'bg-purple-600 text-white'
              }
            `}>
              {flippedCards.includes(card.id) || matchedPairs.includes(card.id) ? (
                card.type === 'question' ? (
                  <span className="text-xl font-bold">
                    {card.question?.a} × {card.question?.b}
                  </span>
                ) : (
                  <span className="text-2xl font-bold">{card.value}</span>
                )
              ) : (
                '?'
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}