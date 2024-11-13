import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';

interface TimeAttackGameProps {
  onGameEnd: (score: number) => void;
  difficulty: string;
}

export function TimeAttackGame({ onGameEnd, difficulty }: TimeAttackGameProps) {
  const { selectedTables } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  function getInitialTime() {
    switch (difficulty) {
      case 'easy': return 60;
      case 'medium': return 45;
      case 'hard': return 30;
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const finalScore = Math.round((correctAnswers / (questionsAnswered || 1)) * 100);
          onGameEnd(finalScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [correctAnswers, questionsAnswered]);

  function generateQuestion() {
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const multiplier = Math.floor(Math.random() * 10) + 1;
    return { table, multiplier, result: table * multiplier };
  }

  function handleAnswer() {
    const isCorrect = parseInt(answer) === currentQuestion.result;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) setCorrectAnswers(prev => prev + 1);
    
    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      setCurrentQuestion(generateQuestion());
      setQuestionsAnswered(prev => prev + 1);
    }, 1000);
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-medium">
            Questions répondues : {questionsAnswered}
          </div>
          <div className="text-lg font-medium">
            Temps restant : {timeLeft}s
          </div>
        </div>

        <div className="text-center space-y-6">
          <motion.h2
            key={currentQuestion.table + currentQuestion.multiplier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            {currentQuestion.table} × {currentQuestion.multiplier} = ?
          </motion.h2>

          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && answer && handleAnswer()}
            className="text-2xl text-center w-32 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            autoFocus
          />

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`flex justify-center items-center space-x-2 ${
                  feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {feedback === 'correct' 
                  ? <Check className="h-6 w-6" />
                  : <X className="h-6 w-6" />
                }
                <span className="font-medium">
                  {feedback === 'correct' ? 'Correct !' : `Incorrect ! La réponse était ${currentQuestion.result}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">Score actuel :</span>
          <span className="text-lg font-bold text-purple-600">
            {Math.round((correctAnswers / (questionsAnswered || 1)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}