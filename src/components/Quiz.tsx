import React, { useState } from 'react';
import { Trophy, Star, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { ClassicGame } from './games/ClassicGame';
import { TimeAttackGame } from './games/TimeAttackGame';
import { MemoryGame } from './games/MemoryGame';

interface QuizProps {
  onEnd: () => void;
  mode: 'classic' | 'memory' | 'timeAttack';
}

export function Quiz({ onEnd, mode }: QuizProps) {
  const { difficulty, setScore, saveGameStats } = useGame();
  const [showResults, setShowResults] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const handleGameEnd = (score: number) => {
    setCurrentScore(score);
    setScore(score);
    
    if (score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    saveGameStats({
      score,
      difficulty,
      tables: [],
      questionsAnswered: mode === 'classic' ? 10 : 0,
      correctAnswers: Math.round((score / 100) * (mode === 'classic' ? 10 : 0)),
      averageResponseTime: 0
    });

    setShowResults(true);
  };

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto space-y-8"
      >
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            {currentScore >= 80 ? (
              <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
            ) : currentScore >= 50 ? (
              <Star className="h-16 w-16 mx-auto text-purple-500" />
            ) : (
              <Timer className="h-16 w-16 mx-auto text-blue-500" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold mb-4">
            {currentScore >= 80 ? 'Excellent travail !' :
             currentScore >= 50 ? 'Bien joué !' :
             'Continue tes efforts !'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{currentScore}%</div>
              <div className="text-sm text-purple-600">Score Final</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((currentScore / 100) * (mode === 'classic' ? 10 : 0))}
              </div>
              <div className="text-sm text-green-600">Bonnes Réponses</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentScore(0);
              }}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Rejouer
            </button>
            <button
              onClick={onEnd}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour au menu
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  switch (mode) {
    case 'classic':
      return <ClassicGame onGameEnd={handleGameEnd} difficulty={difficulty} />;
    case 'timeAttack':
      return <TimeAttackGame onGameEnd={handleGameEnd} difficulty={difficulty} />;
    case 'memory':
      return <MemoryGame onGameEnd={handleGameEnd} />;
    default:
      return null;
  }
}