import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import confetti from 'canvas-confetti';

interface ClassicGameProps {
  onGameEnd: (score: number) => void;
  difficulty: string;
}

export function ClassicGame({ onGameEnd, difficulty }: ClassicGameProps) {
  const { selectedTables } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState(() => generateQuestion(selectedTables));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => getQuestionTime(difficulty));
  const [stars, setStars] = useState(0);
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function getQuestionTime(diff: string) {
    switch (diff) {
      case 'easy': return 20;
      case 'medium': return 15;
      case 'hard': return 10;
      default: return 20;
    }
  }

  function generateQuestion(tables: number[]) {
    const table = tables[Math.floor(Math.random() * tables.length)];
    const multiplier = Math.floor(Math.random() * 10) + 1;
    return { table, multiplier, result: table * multiplier };
  }

  // Maintenir le focus sur l'input
  useEffect(() => {
    if (inputRef.current && !isAnswerProcessing) {
      inputRef.current.focus();
    }
  }, [isAnswerProcessing, currentQuestion]);

  // Handle timer
  useEffect(() => {
    if (timeLeft <= 0 && !isAnswerProcessing) {
      setIsAnswerProcessing(true);
      setFeedback('incorrect');
      setStars(0);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswerProcessing]);

  // Handle answer processing
  useEffect(() => {
    if (isAnswerProcessing) {
      const timer = setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        setCurrentQuestion(generateQuestion(selectedTables));
        setQuestionsAnswered(prev => prev + 1);
        setTimeLeft(getQuestionTime(difficulty));
        setIsAnswerProcessing(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAnswerProcessing, selectedTables, difficulty]);

  // Handle game end
  useEffect(() => {
    if (questionsAnswered >= 10) {
      const finalScore = Math.round((correctAnswers / 10) * 100);
      onGameEnd(finalScore);
    }
  }, [questionsAnswered, correctAnswers, onGameEnd]);

  const handleAnswer = useCallback(() => {
    if (isAnswerProcessing) return;

    const isCorrect = parseInt(answer) === currentQuestion.result;
    setIsAnswerProcessing(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const newStars = Math.min(stars + 1, 5);
      setStars(newStars);
      
      if (newStars === 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setStars(0);
    }
  }, [answer, currentQuestion.result, stars, isAnswerProcessing]);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-medium">
            Question {questionsAnswered + 1}/10
          </div>
          <motion.div 
            key={timeLeft}
            initial={{ scale: 1 }}
            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
            className={`text-lg font-medium ${timeLeft <= 5 ? 'text-red-600' : ''}`}
          >
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / getQuestionTime(difficulty)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="mt-1 block text-center">{timeLeft}s</span>
          </motion.div>
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
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && answer && handleAnswer()}
            className="text-2xl text-center w-32 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            disabled={isAnswerProcessing}
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
          <span className="font-medium">Série d'étoiles :</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{ scale: index < stars ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Star
                  className={`h-6 w-6 ${
                    index < stars
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}