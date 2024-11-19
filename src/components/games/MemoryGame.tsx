import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { difficultyTracker } from '../../services/difficultyTracking';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Star, Brain } from 'lucide-react';
import './MemoryGame.css';

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
  const { selectedTables, addXP } = useGame();
  const { user } = useAuth();
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // Increased time to 3 minutes
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted]);

  useEffect(() => {
    if (matchedPairs.length === 16) {
      handleGameEnd();
    }
  }, [matchedPairs.length]);

  useEffect(() => {
    // Update score in real-time
    const score = calculateScore();
    setCurrentScore(score);
  }, [matchedPairs.length, moves, timeLeft]);

  function calculateScore(): number {
    const totalPairs = 8;
    const maxMoves = totalPairs * 2.5; // Expected maximum moves for a good game
    const maxTime = 180; // Maximum time in seconds

    // Base score from matched pairs (60% of total)
    const matchScore = (matchedPairs.length / 16) * 60;

    // Efficiency score based on moves (20% of total)
    const moveEfficiency = Math.max(0, 1 - (moves / maxMoves));
    const moveScore = moveEfficiency * 20;

    // Time bonus (20% of total)
    const timeBonus = (timeLeft / maxTime) * 20;

    // Streak bonus (up to 10 extra points)
    const streakBonus = Math.min(10, streak * 2);

    const totalScore = Math.round(matchScore + moveScore + timeBonus + streakBonus);
    return Math.min(100, Math.max(0, totalScore));
  }

  function handleGameEnd() {
    const finalScore = calculateScore();
    
    // Award XP based on performance
    if (finalScore >= 90) {
      addXP(100);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (finalScore >= 70) {
      addXP(50);
      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.6 }
      });
    } else if (finalScore >= 50) {
      addXP(25);
    }

    onGameEnd(finalScore);
  }

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

  async function handleCardClick(cardId: number) {
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = memoryCards.find(card => card.id === firstId);
      const secondCard = memoryCards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        setMatchedPairs([...matchedPairs, firstId, secondId]);
        setFlippedCards([]);
        setStreak(prev => prev + 1);
        
        if (streak >= 2) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 }
          });
        }

        if (user && firstCard.type === 'question') {
          await difficultyTracker.updateDifficulty(
            user,
            firstCard.question!.a,
            firstCard.question!.b,
            true
          );
        }
      } else {
        setStreak(0);
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="font-medium">
              {matchedPairs.length / 2} / 8
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span className="font-medium">{timeLeft}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-green-600" />
            <span className="font-medium">{moves}</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="font-medium text-purple-600">{currentScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 h-[calc(100vh-300px)] max-h-[600px]">
        {memoryCards.map(card => {
          const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);
          return (
            <motion.div
              key={card.id}
              className="relative aspect-square"
              onClick={() => handleCardClick(card.id)}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={`memory-card-container ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="memory-card-front">
                  <span className="text-2xl text-white">?</span>
                </div>
                <div className="memory-card-back">
                  {card.type === 'question' ? (
                    <span className="text-lg font-bold">
                      {card.question?.a} × {card.question?.b}
                    </span>
                  ) : (
                    <span className="text-xl font-bold">{card.value}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 ${
              i < streak ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {!gameStarted && (
        <div className="text-center text-gray-600">
          Clique sur une carte pour commencer !
        </div>
      )}
    </div>
  );
}